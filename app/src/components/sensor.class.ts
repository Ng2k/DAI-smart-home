/**
 * @file sensor.class.ts
 * @author Nicola Guerra
 */
import path from "path";
import type { MqttClient } from "mqtt";
import { Component, type ComponentConfig } from "@/components";

export type SensorMetadata = {
	uom: string;
	freq: number;        // update frequency in seconds
	freq_uom: string;    // e.g., "s"
	actuator: string;    // associated actuator
	initial_value: number;
	max_value: number;
};

export class Sensor extends Component {
	public override readonly pubTopic: string;
	public override readonly subTopic: string;

	private value: number;
	private target: number; // target value for smooth convergence
	private actuatorState: boolean = false;

	constructor(config: ComponentConfig, mqtt: MqttClient, initialValue: number) {
		super(config, mqtt);

		this.logger = this.logger.child({ name: path.basename(__filename) });
		const roomTopic = `room/${config.room_id}`;
		this.pubTopic = `${roomTopic}/sensors/${config.name}`;
		const { actuator } = this.config.metadata as SensorMetadata;
		this.subTopic = `${roomTopic}/actuators/${actuator}/ack`;

		this.value = initialValue;
		this.target = initialValue;

		// Subscribe to actuator ack messages
		mqtt.subscribe(this.subTopic, (error, granted) => {
			if (error) {
				this.logger.error({ error }, "Error during subscription");
				return;
			}
			this.logger.debug({ granted }, "Sensor subscribed to actuator ack");
		});

		// Update actuator state from MQTT
		mqtt.on("message", (_, payload) => {
			try {
				const msg = JSON.parse(payload.toString());
				this.actuatorState = Boolean(msg.value);
			} catch {
				// ignore non-JSON messages
			}
		});

		this.logger.info("Sensor initialized");
	}

	/**
	 * Start sensor simulation
	 */
	public start(): void {
		const meta = this.config.metadata as SensorMetadata;

		setInterval(async () => {
			try {
				const alpha = 0.05; // how fast it converges (smaller = slower)
				let delta = 0;

				if (this.config.name === "temperature") {
					this.target = this.actuatorState ? meta.max_value : meta.initial_value;
					delta = (this.target - this.value) * alpha;

				} else if (this.config.name === "humidity") {
					this.target = this.actuatorState ? meta.initial_value : meta.max_value;
					delta = (this.target - this.value) * alpha;
				}

				this.value += delta;

				// Optional: clamp values to reasonable range
				if (this.config.name === "temperature") {
					this.value = Math.max(-20, Math.min(200, this.value));
				}
				if (this.config.name === "humidity") {
					this.value = Math.max(0, Math.min(100, this.value));
				}

				await this.mqtt.publishAsync(this.pubTopic, JSON.stringify({ value: this.value }));

				this.logger.debug(
					{
						sensor: this.config.name,
						value: this.value.toFixed(2),
						target: this.target,
						actuatorState: this.actuatorState
					},
					"Sensor value published"
				);

			} catch (error) {
				this.logger.error({ error }, "Error publishing sensor value");
			}
		}, meta.freq * 1000);
	}
}


