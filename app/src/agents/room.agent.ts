/**
 * @file room.agent.ts
 * @brief Represents a Room Agent that registers itself with the Registry Agent via MQTT.
 * @author
 */
import { Agent } from "./agent.class";
import type { MQTTConfig } from "./types";
import { RegistrationHandler } from "../utils/registration.handler";

export class RoomAgent extends Agent {
	private readonly _registrationHandler: RegistrationHandler;

	constructor(name: string, configs: MQTTConfig ) {
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

		this.mqttClient.on("message", async (topic, message) => {
			switch (topic) {
				case this.ackRegistrationTopic:
					try {
						await this._registrationHandler.handleAck(message.toString());
						this._isRegistered = true;
						this.childLogger.info("Agent registered successfully");
						this.childLogger.debug({ payload }, "Payload received from RegistryAgent");
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
}
