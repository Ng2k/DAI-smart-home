/**
 * @file room.agent.ts
 * @brief Represents a Room Agent that registers itself with the Registry Agent via MQTT.
 * @author
 */
import { Agent } from "./agent.class";
import type { MQTTConfig } from "./types";

export class RoomAgent extends Agent {

	constructor(name: string, configs: MQTTConfig ) {
		super(name, __filename, configs);
	}

	public override async initialize(): Promise<void> {
		super.initialize();

		const payload = this.toJSON();
		this.childLogger.debug({ payload }, "Starting registration with RegistryAgent...");

		try {
			await this.mqttClient.subscribeAsync(this.ackRegistrationTopic, { qos: 1 });
			this.childLogger.info("Subscribed to ack registration topic");
		} catch (error) {
			this.childLogger.error({ error }, "Error subscribing to ack registration topic");
		}

		try {
			await this.mqttClient.publishAsync(
				this.registrationTopic,
				JSON.stringify(payload),
				{ qos: 1 }
			);
			this.childLogger.info("Registration message published");
		} catch (error) {
			this.childLogger.error({ error }, "Error publishing registration message");
		}

		this.mqttClient.on("message", async (topic, message) => {
			if (topic !== this.ackRegistrationTopic) return;

			const { success } = JSON.parse(message.toString());
			if (!success) {
				this.childLogger.error("Registration failed");
				this._isRegistered = false;
				return;
			}
			this._isRegistered = true;
			this.childLogger.info("Agent registered successfully");
			this.childLogger.debug({ payload }, "Payload received from RegistryAgent");
		});
	}
}
