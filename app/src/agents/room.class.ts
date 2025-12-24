/**
 * @brief Room agent
 * @file room.class.ts
 * @author Nicola Guerra
 */
import type { MqttClient } from "mqtt";

import { logger, type Logger } from "@/libs/logger.ts";
import { Sensor, Actuator, type SensorMetadata } from "@/components";

export class RoomAgent {
	protected readonly logger: Logger;

	private orchestratorCommand: Record<string, boolean> = { heater: false, dehumidifier: false };
	private actuatorState: {
		heater: { curr: boolean, next: boolean },
		dehumidifier: { curr: boolean, next: boolean }
	} = {
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
		this.logger = logger.child({ name: this.constructor.name, id: this.id })
		if (!id.trim()) this.logger.error({ id }, "Invalid room id");

		sensors.forEach(sensor => sensor.start());

		const roomTopic = `room/${id}`;
		const topics = [`${roomTopic}/sensors/+`, `${roomTopic}/actuators/+/ack`];

		this.mqtt.subscribe(topics, (error, granted) => {
			if (error) {
				this.logger.error({ error }, "Error during subscription to topics");
				return;
			}

			this.logger.debug({ granted }, `Room subscribed to sensor topics`);
		})

		this.mqtt.on("message", (topic, payload) => {
			const { value } = JSON.parse(payload.toString());
			this.logger.debug({ topic, payload: { value } }, "Message received from topic");

			const { heater, dehumidifier } = this.actuatorState;
			if (topic === `${roomTopic}/actuators/heater/ack`) {
				heater.curr = value;
			}
			if (topic === `${roomTopic}/actuators/dehumidifier/ack`) {
				dehumidifier.curr = value;
			}

			if (topic === `${roomTopic}/sensors/temperature`) {
				const state = this.actuatorState.heater;
				sensors.forEach(async sensor => {
					if (sensor.config.name !== "temperature") return;

					const metadata = sensor.config.metadata as SensorMetadata;
					if (value < metadata.initial_value) state.next = true;
					if (value > metadata.max_value) state.next = false;

					if (state.curr === state.next) return;

					this.mqtt.publish(
						`${roomTopic}/actuators/heater`,
						JSON.stringify({ value: state.next }),
						(error, _) => {
							if (error) {
								this.logger.error({ error }, "Error during publishing");
								return;
							}
							this.logger.info(
								{ topic: `${roomTopic}/actuators/heater`, value: state.next },
								"Message published"
							);
						}
					);
				})
			}

			if (topic === `${roomTopic}/sensors/humidity`) {
				const state = this.actuatorState.heater;
				sensors.forEach(async sensor => {
					if (sensor.config.name !== "humidity") return;

					const metadata = sensor.config.metadata as SensorMetadata;
					if (value < metadata.initial_value) state.next = false;
					if (value > metadata.max_value) state.next = true;

					if (state.curr === state.next) return;

					this.mqtt.publish(
						`${roomTopic}/actuators/dehumidifier`,
						JSON.stringify({ value: state.next }),
						(error, _) => {
							if (error) {
								this.logger.error({ error }, "Error during publishing");
								return;
							}
							this.logger.info(
								{ topic: `${roomTopic}/actuators/dehumidifier`, value: state.next },
								"Message published"
							);
						}
					);
				})
			}
		});
	}
}
