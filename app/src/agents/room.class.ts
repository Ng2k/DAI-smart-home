/**
 * @file room.class.ts
 * @author Nicola Guerra
 */
import { basename } from "path";
import type { MqttClient } from "mqtt";

import { logger, type Logger } from "@/libs/logger";
import { Sensor, Actuator, type SensorMetadata } from "@/components";
import { roomState, comfortViolation } from "@/metrics/room.metrics";
import { actuatorCommandsTotal } from "@/metrics/actuator.metrics";

type GrantPayload = {
	value: boolean;
	lease_ms?: number;
}

export class RoomAgent {
	private readonly logger: Logger;
	private actuatorsState: Record<string, boolean> = {};

	constructor(
		private readonly roomId: string,
		private readonly sensors: Sensor[],
		private readonly actuators: Actuator[],
		private readonly mqtt: MqttClient
	) {
		this.logger = logger.child({ name: basename(__filename), id: roomId });

		this.actuatorsState = Object.fromEntries(
			actuators.map(a => [a.config.name, false])
		);

		const base = `room/${roomId}`;

		const topics = [
			`${base}/sensors/+`,
			`${base}/actuators/+/ack`,
			`${base}/actuators/+/grant`
		]
		this.mqtt.subscribe(
			topics,
			(error, granted) => {
				if (error) {
					this.logger.error({ error }, "Errore subscribing to topics");
					return;
				}

				this.logger.debug({ granted }, "Successfully subscribed to topics");
			}
		);

		this.mqtt.on(
			"message",
			(topic, payload) => {
				this.onMessage(topic, payload)
			}
		);

		this.sensors.forEach(s => s.start());
	}

	// private methods -----------------------------------------------------------------------------

	/**
	 * Handles message from the subscribed topics
	 * @param topic {string} mqtt topic
	 * @param payload {Buffer} body of the mqtt message
	 * @returns {void}
	 */
	private onMessage(topic: string, payload: Buffer): void {
		const parts = topic.split("/");

		if (topic.endsWith("/grant")) {
			const actuator = parts.at(-2) || "";
			const { value } = JSON.parse(payload.toString()) as GrantPayload;
			this.applyGrant(actuator, value);
			return;
		}

		if (topic.endsWith("/ack")) {
			const actuator = parts.at(-2);
			const value = JSON.parse(payload.toString()) as { value: boolean }
			this.actuatorsState[actuator] = value;
			return;
		}

		const sensorName = parts.at(-1)!;
		const sensor = this.sensors.find(s => s.config.name === sensorName);
		if (!sensor) return;

		const value = Number(JSON.parse(payload.toString()).value);
		const meta = sensor.config.metadata as SensorMetadata;

		roomState.set(
			{ room_id: this.roomId, dimension: sensorName },
			value
		);

		this.evaluateAndRequest(sensorName, value, meta);
	}

	/**
	 * Evaluate sensor values
	 * @param sensorName {string} name of the sensor
	 * @param value {number} value of the mqtt message
	 * @param meta {SensorMetadata} metadata of the sensor from the database
	 * @returns {void}
	 */
	private evaluateAndRequest(sensorName: string, value: number, meta: SensorMetadata): void {
		let desiredState: boolean | undefined;
		const { initial_value, max_value, actuator } = meta;

		switch (sensorName) {
			case "temperature":
			case "luminosity":
				if (value <= initial_value) desiredState = true;
				else if (value >= max_value) desiredState = false;
				break;

			case "co2":
			case "humidity":
				if (value >= max_value) desiredState = true;
				else if (value <= initial_value) desiredState = false;
				break;

			default: { return; }
		}

		if (
			desiredState === undefined ||
			this.actuatorsState[actuator] === desiredState
		) {
			return;
		}

		this.sendRequest(actuator, desiredState);

		const temperatureViolation = (
			sensorName === "temperature" &&
			(value < initial_value || value > max_value)
		);
		const co2Violation = sensorName === "co2" && value > max_value;
		const luminosityViolation = sensorName === "luminosity" && value < initial_value;
		const violation = temperatureViolation || co2Violation || luminosityViolation;

		comfortViolation.set({ room_id: this.roomId }, violation ? 1 : 0);
	}

	/**
	 * Send the request to the orchestrator via mqtt
	 * @param actuator {string} name of the actuator
	 * @param value {boolean} value for the actuator
	 * @returns {void}
	 */
	private sendRequest(actuator: string, value: boolean): void {
		const topic = `room/${this.roomId}/actuators/${actuator}/request`;
		this.mqtt.publish(topic, JSON.stringify({ value }));
		this.logger.info({ actuator, value }, "Actuator request sent");
	}

	/**
	 * Send the command to apply the grant to the actuator
	 * @param actuator {string} Actuator name
	 * @param value {boolean} Command value
	 * @returns {void}
	 */
	private applyGrant(actuator: string, value: boolean): void {
		const topic = `room/${this.roomId}/actuators/${actuator}`;
		this.mqtt.publish(topic, JSON.stringify({ value }));
		this.logger.info({ actuator, value }, "Grant applied");

		actuatorCommandsTotal.inc({
			room_id: this.roomId,
			actuator: actuator
		})
	}
}
