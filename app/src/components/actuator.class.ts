/**
 * @file actuator.class.ts
 * @author Nicola Guerra
 */
import path from "path";
import type { MqttClient } from "mqtt";

import { Component, type ComponentConfig } from "@/components";

export type ActuatorConfig = {};

export class Actuator extends Component {
	public override readonly pubTopic: string;
	public override readonly subTopic: string;

	constructor(config: ComponentConfig, mqtt: MqttClient) {
		super(config, mqtt);
		this.logger = this.logger.child({ name: path.basename(__filename) });
		this.pubTopic = `room/${config.room_id}/actuators/${config.name}/ack`;
		this.subTopic = `room/${config.room_id}/actuators/${config.name}`;

		this.mqtt.subscribe(this.subTopic, (error, granted) => {
			if (error) {
				this.logger.error({ error }, "Error during subscription to topic");
				return;
			}
			this.logger.debug({ granted }, "Actuator subscribed to topics");
		});

		this.mqtt.on("message", async (_, payload) => {
			const msg = JSON.parse(payload.toString());
			this.logger.debug(`Actuators is turning ${msg.value ? "on" : "off"} ${config.name}`);

			try {
				this.mqtt.publish(this.pubTopic, JSON.stringify(msg));
				this.logger.info("Publish ACK");
			} catch (error) {
				this.logger.error({ error }, "Error during ACK publishing");
			}
		});

		this.logger.info("Actuator initialized");
	}
}
