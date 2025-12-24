/**
 * @file sensor.class.ts
 * @author Nicola Guerra
 */
import path from "path";
import type { MqttClient } from "mqtt";

import { Component, type ComponentConfig } from "@/components";

export type SensorMetadata = {
	uom: string;
	freq: number;
	freq_uom: string;
	actuator: string;
	initial_value: number;
	max_value: number
}

export class Sensor extends Component {
	public override readonly pubTopic: string;
	public override readonly subTopic: string;

	private env: boolean = false;
	private value: number;

	constructor(config: ComponentConfig, mqtt: MqttClient, value: number) {
		super(config, mqtt);
		this.logger = this.logger.child({ name: path.basename(__filename) });

		const roomTopic = `room/${config.room_id}`;
		this.pubTopic = `${roomTopic}/sensors/${config.name}`;
		const { actuator } = this.config.metadata as SensorMetadata;
		this.subTopic = `${roomTopic}/actuators/${actuator}/ack`;

		this.value = value;

		mqtt.subscribe(this.subTopic, (error, granted) => {
			if (error) {
				this.logger.error({ error }, "Error during subscription to topic");
				return;
			}

			this.logger.debug({ granted }, "Sensor subscribed to topic");
		});

		mqtt.on("message", (_, payload) => {
			this.env = JSON.parse(payload.toString()).value;
		});

		this.logger.info("Sensor initialized");
	}

	// public methods ------------------------------------------------------------------------------
	/**
	 * @description Start the sensor reading
	 * @returns {void}
	 */
	public start(): void {
		setInterval(async () => {
			try {
				let dt = 0;
				if (this.config.name === "temperature") dt = this.env ? 0.5 : -0.25;
				if (this.config.name === "humidity") dt = this.env ? -0.25 : 0.5;
				this.value += dt;
				await this.mqtt.publishAsync(this.pubTopic, JSON.stringify({ value: this.value }));
				this.logger.info(
					{
						sensor: this.config.name,
						value: this.value,
						uom: (this.config.metadata as SensorMetadata).uom
					},
					"Sensor value published"
				);
			} catch (error) {
				this.logger.error({ error }, "Error during message publishing");
			}
		}, (this.config.metadata as SensorMetadata).freq * 1000);
	}
}
