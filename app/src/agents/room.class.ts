import { basename } from "path";
import type { MqttClient } from "mqtt";
import { logger, type Logger } from "@/libs/logger";
import { Sensor, Actuator, type SensorMetadata } from "@/components";

import {
	roomTemperature, roomHumidity, roomCO2, roomLuminosity,
	roomTemperatureError, roomCO2Error, roomLuminosityError,
	roomComfortViolation, roomEnergyWatts
} from "@/metrics";

const ACTUATOR_POWER: Record<string, number> = {
	heater: 1500,
	dehumidifier: 300,
	ventilation: 400,
	light: 200
};

export class RoomAgent {
	private readonly logger: Logger;
	private actuatorsList: Record<string, boolean> = {};

	constructor(
		private readonly roomId: string,
		private readonly sensors: Sensor[],
		private readonly actuators: Actuator[],
		private readonly mqtt: MqttClient
	) {
		this.logger = logger.child({ name: basename(__filename), id: roomId });

		this.actuatorsList = actuators.reduce((acc, act) => {
			return { ...acc, [act.config.name]: false };
		}, {});

		const base = `room/${roomId}`;

		this.mqtt.subscribe(
			[`${base}/sensors/+`, `${base}/actuators/+/ack`],
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

	private onMessage(topic: string, payload: Buffer) {
		let value: number;

		try {
			value = Number(JSON.parse(payload.toString()).value);
		} catch {
			this.logger.warn({ topic }, "Invalid payload");
			return;
		}

		const parts = topic.split("/");

		/* -------- ACTUATOR ACK -------- */
		if (parts.includes("actuators")) {
			const actuator = parts.at(-2);
			if (!actuator) {
				this.logger.warn("No actuator definend in the topic");
				return;
			}
			this.actuatorsList[actuator] = Boolean(value);
			this.updateEnergyMetric();
			return;
		}

		/* -------- SENSOR -------- */
		const sensorName = parts.at(-1)!;
		const sensor = this.sensors.find(s => s.config.name === sensorName);
		if (!sensor) return;

		this.logger.debug({ sensor: sensorName, value }, "sensor value");
		const meta = sensor.config.metadata as SensorMetadata;

		this.updateMetrics(sensorName, value, meta);
		this.evaluateAndAct(sensorName, value, meta);
	}

	private evaluateAndAct(
		sensorName: string,
		value: number,
		meta: SensorMetadata
	) {
		let desiredState: boolean | undefined;
		const { initial_value, max_value, actuator } = meta;
		switch (sensorName) {
			case "temperature": {
				if (value <= initial_value) desiredState = true;
				else if (value >= max_value) desiredState = false;
				break;
			}
			case "luminosity": {
				if (value <= initial_value) desiredState = true;
				else if (value >= max_value) desiredState = false;
				break;
			}
			case "co2": {
				if (value >= max_value) desiredState = true;
				else if (value <= initial_value) desiredState = false;
				break;
			}
			case "humidity": {
				if (value >= max_value) desiredState = true;
				else if (value <= initial_value) desiredState = false;
				break;
			}
			default: { return; }
		}

		if (
			desiredState === undefined ||
			this.actuatorsList[actuator] === desiredState
		) {
			return;
		}

		this.sendActuatorCommand(actuator, desiredState);

		const temperatureViolation = (
			sensorName === "temperature" &&
			(value < initial_value || value > max_value)
		);
		const co2Violation = sensorName === "co2" && value > max_value;
		const luminosityViolation = sensorName === "luminosity" && value < initial_value;
		const violation = temperatureViolation || co2Violation || luminosityViolation;

		roomComfortViolation.set({ room_id: this.roomId }, violation ? 1 : 0);
	}

	private sendActuatorCommand(actuator: string, state: boolean) {
		const topic = `room/${this.roomId}/actuators/${actuator}`;
		this.logger.info(`Room publish to ${topic}`)
		this.mqtt.publish(topic, JSON.stringify({ value: state }));
		this.actuatorsList[actuator] = state;
		this.updateEnergyMetric();

		this.logger.info({ actuator, state }, "Actuator command sent");
	}

	private updateEnergyMetric() {
		const watts = Object.entries(this.actuators)
			.filter(([, on]) => on)
			.reduce((sum, [a]) => sum + (ACTUATOR_POWER[a] ?? 0), 0);

		roomEnergyWatts.set({ room_id: this.roomId }, watts);
	}

	private updateMetrics(
		sensorName: string,
		value: number,
		meta: SensorMetadata
	) {
		switch (sensorName) {
			case "temperature":
				roomTemperature.set({ room_id: this.roomId }, value);
				roomTemperatureError.set(
					{ room_id: this.roomId },
					value - meta.initial_value
				);
				break;

			case "humidity":
				roomHumidity.set({ room_id: this.roomId }, value);
				break;

			case "co2":
				roomCO2.set({ room_id: this.roomId }, value);
				roomCO2Error.set(
					{ room_id: this.roomId },
					value - meta.initial_value
				);
				break;

			case "luminosity":
				roomLuminosity.set({ room_id: this.roomId }, value);
				roomLuminosityError.set({ room_id: this.roomId }, value - meta.initial_value);
				break;
		}
	}
}
