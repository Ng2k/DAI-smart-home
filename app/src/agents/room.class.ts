
/**
 * @brief Room agent
 * @file room.class.ts
 * @author Nicola Guerra
 */
import type { MqttClient } from "mqtt";
import { logger, type Logger } from "@/libs/logger.ts";
import { Sensor, Actuator, type SensorMetadata } from "@/components";

type EnergyMode = "eco" | "power";

type RoomPolicy = {
	energyMode: EnergyMode;
	allowActuators: boolean;
};

type ActuatorState = {
	curr: boolean;
	next: boolean;
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

	constructor(
		private readonly id: string,
		private readonly name: string,
		private readonly sensors: Sensor[],
		private readonly actuators: Actuator[],
		private readonly mqtt: MqttClient
	) {
		this.logger = logger.child({ name: this.constructor.name, id });

		sensors.forEach(sensor => sensor.start());

		const roomTopic = `room/${id}`;
		this.mqtt.subscribe(
			[
				`${roomTopic}/sensors/+`,
				`${roomTopic}/actuators/+/ack`,
				`${roomTopic}/policy`,
				`room/all/policy`
			],
			err => err && this.logger.error({ err }, "Subscription failed")
		);

		this.mqtt.on("message", (topic, payload) =>
			this.handleMessage(topic, payload)
		);
	}

	// private methods -----------------------------------------------------------------------------

	private handleMessage(topic: string, payload: Buffer): void {
		const data = JSON.parse(payload.toString());

		if (topic.endsWith("/policy")) {
			this.policy = data;
			this.logger.info({ policy: this.policy }, "Policy updated");
			return;
		}

		if (topic.includes("/actuators/")) {
			this.updateActuatorState(topic, data.value);
			return;
		}

		if (topic.includes("/sensors/")) {
			this.handleSensorData(topic, data.value);
		}
	}

	private updateActuatorState(topic: string, value: boolean): void {
		const actuator = topic.split("/").at(-2)!;
		const state = this.actuatorsState[actuator];

		if (!state) return;
		state.curr = value;

		this.logger.debug({ actuator, value }, "Actuator ACK received");
	}

	private handleSensorData(topic: string, value: number): void {
		const sensorName = topic.split("/").at(-1)!;

		const sensor = this.sensors.find(s => s.config.name === sensorName);
		if (!sensor) return;

		const metadata = sensor.config.metadata as SensorMetadata;

		if (sensorName === "temperature") {
			this.evaluateActuator(
				"heater",
				value < metadata.initial_value,
				value > metadata.max_value
			);
		}

		if (sensorName === "humidity") {
			this.evaluateActuator(
				"dehumidifier",
				value > metadata.max_value,
				value < metadata.initial_value
			);
		}
	}

	private evaluateActuator(
		actuator: string,
		shouldTurnOn: boolean,
		shouldTurnOff: boolean
	): void {
		const state = this.actuatorsState[actuator];

		if (!state) return;

		if (shouldTurnOn) state.next = true;
		if (shouldTurnOff) state.next = false;

		if (state.curr === state.next) return;

		if (!this.policy.allowActuators && state.next) {
			this.logger.info(
				{ actuator, policy: this.policy },
				"Activation blocked by ECO policy"
			);
			return;
		}

		this.publishActuatorCommand(actuator, state.next);
	}

	private publishActuatorCommand(actuator: string, value: boolean): void {
		const topic = `room/${this.id}/actuators/${actuator}`;

		this.mqtt.publish(topic, JSON.stringify({ value }), err => {
			if (err) {
				this.logger.error({ err, actuator }, "Publish failed");
				return;
			}

			this.logger.info(
				{ actuator, value, policy: this.policy.energyMode },
				"Actuator command issued"
			);
		});
	}
}

