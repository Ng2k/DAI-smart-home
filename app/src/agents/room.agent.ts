/**
 * @file room.agent.ts
 * @brief Represents a Room Agent that registers itself with the Registry Agent via MQTT.
 * @author
 */
import { Agent } from "./agent.class";
import type { MQTTConfig } from "./types";
import { RegistrationHandler } from "./registration.handler";
import { Sensor, SensorType, UnitOfMeasurement } from "../components";

export class RoomAgent extends Agent {
	private readonly _registrationHandler: RegistrationHandler;

	constructor(name: string, configs: MQTTConfig) {
		super(name, __filename, configs);
		this._registrationHandler = new RegistrationHandler(this.mqttClient);
	}

	public override async initialize(): Promise<void> {
		super.initialize();

		const payload = this.toJSON();
		this.childLogger.debug({ payload }, "Starting registration with RegistryAgent...");
		await this._registrationHandler.handleRegistration(
			this.registrationTopic,
			this.ackRegistrationTopic,
			payload
		);
	}

	public async start(): Promise<void> {
		const logger = this.childLogger;
		logger.info("Starting room agent");

		this.mqttClient.on("message", async (topic, message) => {
			switch (topic) {
				case this.ackRegistrationTopic:
					try {
						const agent = await this._registrationHandler.handleAck(message.toString());
						this._isRegistered = true;
						logger.info(`${this.name} agent registered successfully`);

						this._type = agent.type;
						this._sensors = agent.sensors.map((sensor: any) => new Sensor(
							sensor.name.toLowerCase() as SensorType,
							sensor.uom.toLowerCase() as UnitOfMeasurement,
							sensor.publish_interval_s,
							sensor.topic.toLowerCase()
						));
						this._actuators = agent.actuators;
						this._controllers = agent.controllers;

						await this._startAllSensors();
						logger.info(`${this.name} sensors initialized successfully`);

						this.childLogger.info("Agent registered successfully");
						this.childLogger.debug(
							{ agent },
							"Payload received from RegistryAgent"
						);
					} catch (error) {
						this.childLogger.error(
							{ error },
							(error instanceof Error) ? error.message : "Unknown error"
						);
					}
					break;
				default:
					return;
			}
		});
	}

	private async _startAllSensors(): Promise<void> {
		await Promise.all(this._sensors.map(async sensor => {
			return sensor.start();
		}));
	}
}
