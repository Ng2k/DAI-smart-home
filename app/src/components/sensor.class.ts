/**
 * @file sensor.class.ts
 * @author Nicola Guerra
 */
import { basename } from "path";
import type { MqttClient } from "mqtt";

import { logger, type Logger } from "@/libs/logger";

export interface SensorMetadata {
	name: "temperature" | "humidity" | "co2" | "luminosity";
	initial_value: number;
	max_value: number;
	freq: number;
	actuator: string;
}

export interface SensorConfig {
	id: string;
	name: string;
	room_id: string;
	metadata: SensorMetadata;
	actuator?: string;
}

export class Sensor {
	private readonly logger: Logger;
	private value: number;
	private actuatorOn = false;
	private timer?: NodeJS.Timeout;

	constructor(
		public readonly config: SensorConfig,
		private readonly mqtt: MqttClient
	) {
		this.logger = logger.child({ name: basename(__filename), id: this.config.id });
		this.value = config.metadata.initial_value;

		const actuator = (config.metadata as SensorMetadata).actuator;
		if (!actuator) return;

		const topic = `room/${config.room_id}/actuators/${actuator}/ack`;
		this.mqtt.subscribe(topic);
		this.mqtt.on("message", (t, payload) => {
			if (t !== topic) return;
			try {
				this.actuatorOn = Boolean(JSON.parse(payload.toString()).value);
			} catch {
				this.logger.warn("Invalid actuator payload");
			}
		});
	}

	// public methods ------------------------------------------------------------------------------

	public start() {
		this.timer = setInterval(
			() => this.tick(),
			this.config.metadata.freq * 1000
		);
	}

	public stop() {
		if (this.timer) clearInterval(this.timer);
	}

	// private methods -----------------------------------------------------------------------------

	private tick() {
		this.updateValue();

		const topic = `room/${this.config.room_id}/sensors/${this.config.name}`;
		this.mqtt.publish(topic, JSON.stringify({ value: Number(this.value).toFixed(2) }));
	}

	private updateValue() {
		const conf = this.config;
		let delta = 0;

		switch (conf.name) {
			case "temperature":
				delta = this.actuatorOn ? +0.2 : -0.1;
				break;

			case "luminosity":
				delta = this.actuatorOn ? +20 : -10;
				break;

			case "co2":
				delta = this.actuatorOn ? -15 : +5;
				break;

			case "humidity":
				delta = this.actuatorOn ? -2 : +1;
				break;
		}

		this.value += delta;
		this.value = Math.max(0, Math.min(conf.metadata.max_value, this.value));
	}
}
