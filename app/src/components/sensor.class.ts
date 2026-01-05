
/**
 * @file sensor.class.ts
 * @author Nicola Guerra
 */

import path from "path";
import type { MqttClient } from "mqtt";
import { Component, type ComponentConfig } from "@/components";

export type SensorMetadata = {
	initial_value: number;
	max_value: number;
};

export class Sensor extends Component {
	public override readonly pubTopic: string;

	private current: number;
	private actuatorState = false;
	private interval?: NodeJS.Timeout;

	constructor(config: ComponentConfig, mqtt: MqttClient) {
		super(config, mqtt);

		this.logger = this.logger.child({ name: path.basename(__filename) });

		const meta = config.metadata as SensorMetadata;
		this.current = meta.initial_value;

		this.pubTopic = `room/${config.room_id}/sensors/${config.name}`;

		/* ---------------- ACTUATOR COUPLING ---------------- */

		const actuator =
			config.name === "temperature"
				? "heater"
				: config.name === "humidity"
					? "dehumidifier"
					: undefined;

		if (actuator) {
			this.mqtt.subscribe(
				`room/${config.room_id}/actuators/${actuator}/ack`,
				err => {
					if (err) {
						this.logger.error(
							{ err },
							"Failed to subscribe to actuator ACK"
						);
					}
				}
			);
		}

		this.mqtt.on("message", (topic, payload) => {
			if (!topic.endsWith("/ack")) return;

			try {
				const { value } = JSON.parse(payload.toString());
				this.actuatorState = Boolean(value);

				this.logger.debug(
					{ actuatorState: this.actuatorState },
					"Actuator state updated"
				);
			} catch {
				this.logger.warn("Invalid actuator ACK payload");
			}
		});

		this.logger.info("Sensor initialized");
	}

	/* ---------------- LIFECYCLE ---------------- */

	public start(): void {
		// Publish immediately
		this.publish();

		// Update every second
		this.interval = setInterval(() => this.tick(), 1000);
	}

	public stop(): void {
		if (this.interval) clearInterval(this.interval);
	}

	/* ---------------- PHYSICS SIMULATION ---------------- */

	private tick(): void {
		const meta = this.config.metadata as SensorMetadata;

		switch (this.config.name) {
			case "temperature":
				// Heater ON -> temperature rises
				// Heater OFF -> temperature slowly drops
				this.current += this.actuatorState ? +0.4 : -0.15;
				break;

			case "humidity":
				// Dehumidifier ON -> humidity decreases
				// Dehumidifier OFF -> humidity increases
				this.current += this.actuatorState ? -0.6 : +0.25;
				break;
		}

		/* ---------- Extreme-safe clamping ---------- */

		// Simulation allows unrealistic values but not infinity
		this.current = Math.max(-20, Math.min(200, this.current));

		this.publish();
	}

	/* ---------------- MQTT ---------------- */

	private publish(): void {
		this.mqtt.publish(
			this.pubTopic,
			JSON.stringify({
				value: Number(this.current.toFixed(2))
			})
		);

		this.logger.debug(
			{ value: this.current },
			"Sensor value published"
		);
	}
}

