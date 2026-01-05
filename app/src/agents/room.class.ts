import type { MqttClient } from "mqtt";
import { logger, type Logger } from "@/libs/logger.ts";
import { Sensor, type SensorMetadata } from "@/components";
import {
	roomTemperature,
	roomHumidity,
	roomComfortViolation,
	roomTemperatureError,
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

type ActuatorInternalState = {
	curr: boolean;
	next: boolean;
};

const ACTUATOR_POWER_WATTS: Record<string, number> = {
	heater: 1500,
	dehumidifier: 300
};

export class RoomAgent {
	protected readonly logger: Logger;

	// Default policy to prevent crash
	private policy: RoomPolicy = { energyMode: "power", allowActuators: true };

	private actuatorsState: Record<string, ActuatorInternalState> = {
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
		this.logger = logger.child({ component: "RoomAgent", room_id: id, room_name: name });

		// Start sensors
		sensors.forEach(sensor => sensor.start());

		const baseTopic = `room/${id}`;
		this.mqtt.subscribe(
			[
				`${baseTopic}/sensors/+`,
				`${baseTopic}/actuators/+/ack`,
				`${baseTopic}/policy`,
				`room/all/policy`
			],
			err => err && this.logger.error({ err }, "MQTT subscription failed")
		);

		this.mqtt.on("message", (topic, payload) => this.handleMessage(topic, payload));

		this.logger.info("RoomAgent initialized");
	}

	/* ---------------- MESSAGE HANDLING ---------------- */

	private handleMessage(topic: string, payload: Buffer): void {
		let parsed;
		try {
			parsed = JSON.parse(payload.toString());
		} catch {
			this.logger.warn({ topic, payload: payload.toString() }, "Invalid JSON payload");
			return;
		}

		const { value } = parsed;

		if (topic.endsWith("/policy")) {
			// Update policy safely
			this.policy = value ?? this.policy;
			this.logger.info({ policy: this.policy }, "Policy updated");
			return;
		}

		if (topic.includes("/actuators/")) {
			this.updateActuatorState(topic, Boolean(value));
			return;
		}

		if (topic.includes("/sensors/")) {
			this.handleSensorData(topic, Number(value));
		}
	}

	/* ---------------- SENSOR HANDLING ---------------- */

	private handleSensorData(topic: string, value: number): void {
		const sensorName = topic.split("/").at(-1);
		if (!sensorName) return;

		const sensor = this.sensors.find(s => s.config.name === sensorName);
		if (!sensor) return;

		const meta = sensor.config.metadata as SensorMetadata;

		switch (sensorName) {
			case "temperature": {
				// Simulate actuator effect
				if (this.actuatorsState.heater.curr) value += 0.5;
				else value -= 0.25;

				roomTemperature.set({ room_id: this.id }, value);
				this.updateTemperatureComfortMetrics(value, meta);

				// Turn heater ON if below min, OFF if above max
				this.evaluateActuator(
					"heater",
					value < meta.initial_value,
					value > meta.max_value
				);
				break;
			}

			case "humidity": {
				// Simulate actuator effect
				if (this.actuatorsState.dehumidifier.curr) value -= 0.25;
				else value += 0.5;

				roomHumidity.set({ room_id: this.id }, value);

				// Turn dehumidifier ON if above max, OFF if below min
				this.evaluateActuator(
					"dehumidifier",
					value > meta.max_value,
					value < meta.initial_value
				);
				break;
			}
		}
	}

	/* ---------------- COMFORT METRICS ---------------- */

	private updateTemperatureComfortMetrics(current: number, meta: SensorMetadata): void {
		const target = meta.initial_value;
		const min = meta.initial_value;
		const max = meta.max_value;

		const error = current - target;
		const violated = current < min || current > max;

		roomTemperatureError.set({ room_id: this.id }, error);
		roomComfortViolation.set({ room_id: this.id }, violated ? 1 : 0);

		this.logger.debug({ current, target, error, violated }, "Temperature comfort evaluated");
	}

	/* ---------------- ACTUATOR CONTROL ---------------- */

	private updateActuatorState(topic: string, value: boolean): void {
		const actuator = topic.split("/").at(-2);
		if (!actuator) return;

		const state = this.actuatorsState[actuator];
		if (!state) return;

		state.curr = value;
		actuatorState.set({ room_id: this.id, actuator }, value ? 1 : 0);

		this.updateEnergyMetrics();
		this.logger.info({ actuator, state: value }, "Actuator state acknowledged");
	}

	private evaluateActuator(actuator: string, shouldTurnOn: boolean, shouldTurnOff: boolean): void {
		const state = this.actuatorsState[actuator];
		if (!state) return;

		const policy = this.policy ?? { energyMode: "power", allowActuators: true };

		// Respect eco mode: do not allow new actuators if eco
		if (policy.energyMode === "eco" && shouldTurnOn) {
			shouldTurnOn = false;
			this.logger.info({ actuator }, "Eco mode active: skipping actuator ON");
		}

		if (shouldTurnOn) state.next = true;
		if (shouldTurnOff) state.next = false;

		if (state.curr === state.next) return;

		if (!policy.allowActuators && state.next) {
			policyBlocksTotal.inc({ room_id: this.id });
			policyViolationsTotal.inc({ room_id: this.id });
			this.logger.warn({ actuator }, "Actuator command blocked by policy");
			return;
		}

		this.publishCommand(actuator, state.next);
	}

	private publishCommand(actuator: string, value: boolean): void {
		this.mqtt.publish(`room/${this.id}/actuators/${actuator}`, JSON.stringify({ value }));
		roomCommandsTotal.inc({ room_id: this.id });
		this.logger.info({ actuator, value }, "Actuator command published");
	}

	/* ---------------- ENERGY ---------------- */

	private updateEnergyMetrics(): void {
		const now = Date.now();
		const deltaHours = (now - this.lastEnergyTs) / 3_600_000;
		this.lastEnergyTs = now;

		const powerWatts = Object.entries(this.actuatorsState)
			.filter(([_, s]) => s.curr)
			.reduce((sum, [actuator]) => sum + (ACTUATOR_POWER_WATTS[actuator] ?? 0), 0);

		roomEnergyWatts.set({ room_id: this.id }, powerWatts);
		roomEnergyWhTotal.inc({ room_id: this.id }, powerWatts * deltaHours);
	}
}



