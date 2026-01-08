/**
 * @file actuator.class.ts
 * @author Nicola Guerra
 */
import path from "path";
import type { MqttClient } from "mqtt";

import { Component, type ComponentConfig } from "@/components";
import { actuatorState, actuatorCommandLatencyMs } from "@/metrics/actuator.metrics";
import { roomEnergyWatts, roomEnergyWhTotal } from "@/metrics/system.metrics";

export class Actuator extends Component {
	public override readonly pubTopic: string;
	public override readonly subTopic: string;

	private state = false;

	constructor(config: ComponentConfig, mqtt: MqttClient) {
		super(config, mqtt);

		this.logger = this.logger.child({ name: path.basename(__filename), id: this.config.id });

		const roomTopic = `room/${config.room_id}`;
		this.subTopic = `${roomTopic}/actuators/${config.name}`;
		this.pubTopic = `${this.subTopic}/ack`;

		mqtt.subscribe(this.subTopic, (err, granted) => {
			if (err) {
				this.logger.error({ err }, "Subscribe failed");
				return;
			}

			this.logger.debug({ granted }, "Subscribe succeded");
		});

		mqtt.on("message", (topic, payload) => {
			if (topic !== this.subTopic) return;
			this.handleCommand(payload);
		});

		this.logger.info("Actuator initialized");
	}

	// private methods -----------------------------------------------------------------------------

	/**
	 * Handle command topic
	 * @param payload {Buffer} Body message
	 * @returns {void}
	 */
	private handleCommand(payload: Buffer): void {
		const start = Date.now();
		try {
			const { value } = JSON.parse(payload.toString()) as { value: boolean };
			const desire = Boolean(value);

			if (this.state === desire) return;

			this.state = desire;
			this.publishAck(start);

		} catch (error) {
			this.logger.error({ error }, "Invalid actuator command payload");
		}
	}

	/**
	 * Publish ACK to mqtt topic
	 * @returns {void}
	 */
	private async publishAck(start: number): Promise<void> {
		this.mqtt.publish(
			this.pubTopic,
			JSON.stringify({ value: this.state }),
			{ qos: 1 },
			(err) => {
				if (err) {
					this.logger.error({ err }, "Error publishing ACK");
					return;
				}

				actuatorState.set(
					{ room_id: this.config.room_id, actuator: this.config.name },
					this.state ? 1 : 0
				);

				actuatorCommandLatencyMs.observe(
					{ room_id: this.config.room_id, actuator: this.config.name },
					Date.now() - start
				);

				this.logger.info(
					{ actuator: this.config.name, state: this.state },
					"Actuator state updated"
				);
			}
		);
	}

	// public methods ------------------------------------------------------------------------------

	/**
	 * Returns the state of the actuator
	 * @returns {boolean}
	 */
	public getState(): boolean { return this.state; }
}
