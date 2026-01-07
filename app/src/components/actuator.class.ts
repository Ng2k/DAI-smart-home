/**
 * @file actuator.class.ts
 */
import path from "path";
import type { MqttClient } from "mqtt";

import { Component, type ComponentConfig } from "@/components";
import { actuatorState } from "@/metrics";

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

		mqtt.subscribe(this.subTopic);

		mqtt.on("message", (topic, payload) => {
			this.logger.info({ payload: JSON.parse(payload.toString()) }, "Command received");
			if (topic !== this.subTopic) return;

			try {
				const { value } = JSON.parse(payload.toString());
				this.state = Boolean(value);

				mqtt.publish(this.pubTopic, JSON.stringify({ value: this.state }));

				actuatorState.set(
					{ room_id: config.room_id, actuator: config.name },
					this.state ? 1 : 0
				);
			} catch { }
		});

		this.logger.info("Actuator initialized");
	}
}
