import type { MqttClient } from "mqtt";
import { logger, type Logger } from "@/libs/logger.ts";
import { Sensor, type SensorMetadata } from "@/components";
import {
	roomTemperature,
	roomHumidity,
	actuatorState,
	roomCommandsTotal,
	policyBlocksTotal,
	policyViolationsTotal,
	roomEnergyWatts,
	roomEnergyWhTotal
} from "@/metrics/index.ts";

type EnergyMode = "eco" | "power";

type RoomPolicy = {
	energyMode: EnergyMode;
	allowActuators: boolean;
};

type ActuatorState = {
	curr: boolean;
	next: boolean;
};

const ACTUATOR_POWER_WATTS: Record<string, number> = {
	heater: 1500,
	dehumidifier: 300
};

export class RoomAgent {
	protected readonly logger: Logger;

	private policy: RoomPolicy = {
		energyMode: "power",
		allowActuators: true
	};

	private actuatorsState: Record<string, ActuatorState> = {
		heater: { curr: false, next: false },
		dehumidifier: { curr: false, next: false }
	};

	private lastEnergyTs = Date.now();

	constructor(
		private readonly id: string,
		private readonly name: string,
		private readonly sensors: Sensor[],
		private readonly mqtt: MqttClient
	) {
		this.logger = logger.child({ room: id });

		sensors.forEach(s => s.start());

		const base = `room/${id}`;
		this.mqtt.subscribe(
			[`${base}/sensors/+`, `${base}/actuators/+/ack`, `${base}/policy`, `room/all/policy`],
			err => err && this.logger.error(err)
		);

		this.mqtt.on(
			"message",
			(t, p) => this.handleMessage(t, p)
		);
	}

	/* ---------------- MESSAGE HANDLING ---------------- */

	private handleMessage(topic: string, payload: Buffer): void {
		const { value } = JSON.parse(payload.toString());

		if (topic.endsWith("/policy")) {
			this.policy = value;
			return;
		}

		if (topic.includes("/actuators/")) {
			this.updateActuatorState(topic, value);
			return;
		}

		if (topic.includes("/sensors/")) {
			this.handleSensorData(topic, value);
		}
	}

	/* ---------------- SENSOR ---------------- */

	private handleSensorData(topic: string, value: number): void {
		const sensorName = topic.split("/").at(-1)!;
		const sensor = this.sensors.find(s => s.config.name === sensorName);
		if (!sensor) return;

		const meta = sensor.config.metadata as SensorMetadata;

		if (sensorName === "temperature") {
			roomTemperature.set({ room_id: this.id }, value);
			this.evaluateActuator("heater", value < meta.initial_value, value > meta.max_value);
		}

		if (sensorName === "humidity") {
			roomHumidity.set({ room_id: this.id }, value);
			this.evaluateActuator("dehumidifier", value > meta.max_value, value < meta.initial_value);
		}
	}

	/* ---------------- ACTUATORS ---------------- */

	private updateActuatorState(topic: string, value: boolean): void {
		const actuator = topic.split("/").at(-2)!;
		const state = this.actuatorsState[actuator];
		if (!state) return;

		state.curr = value;
		actuatorState.set({ room_id: this.id, actuator }, value ? 1 : 0);
		this.updateEnergy();
	}

	private evaluateActuator(actuator: string, on: boolean, off: boolean): void {
		const state = this.actuatorsState[actuator];
		if (!state) return;

		if (on) state.next = true;
		if (off) state.next = false;

		if (state.curr === state.next) return;

		if (!this.policy.allowActuators && state.next) {
			policyBlocksTotal.inc({ room_id: this.id });
			policyViolationsTotal.inc({ room_id: this.id });
			return;
		}

		this.publishCommand(actuator, state.next);
	}

	private publishCommand(actuator: string, value: boolean): void {
		this.mqtt.publish(
			`room/${this.id}/actuators/${actuator}`,
			JSON.stringify({ value })
		);
		roomCommandsTotal.inc({ room_id: this.id });
	}

	/* ---------------- ENERGY ---------------- */

	private updateEnergy(): void {
		const now = Date.now();
		const deltaH = (now - this.lastEnergyTs) / 3600000;
		this.lastEnergyTs = now;

		const power = Object.entries(this.actuatorsState)
			.filter(([_, s]) => s.curr)
			.reduce((sum, [a]) => sum + (ACTUATOR_POWER_WATTS[a] ?? 0), 0);

		roomEnergyWatts.set({ room_id: this.id }, power);
		roomEnergyWhTotal.inc({ room_id: this.id }, power * deltaH);
	}
}






