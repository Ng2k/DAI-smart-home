/**
 * @brief Registration handler for the agents
 * @file registration.handler.ts
 * @author Nicola Guerra
 */
import type { MqttClient } from "mqtt";

export class RegistrationHandler {

    constructor(private readonly mqttClient: MqttClient) {}

	public async handleRegistration(
		regTopic: string,
		ackTopic: string,
		payload: Record<string, any>
	): Promise<void> {
		try { await this.mqttClient.publishAsync(regTopic, JSON.stringify(payload), { qos: 1 }); }
		catch (error) { throw new Error("Failed to publish registration message"); }

		try { await this.mqttClient.subscribeAsync(ackTopic, { qos: 1 }); }
		catch (error) { throw new Error("Failed to subscribe to ack topic"); }
	}

	public async handleAck(
		message: string,
	): Promise<void> {
		const { success } = JSON.parse(message);
		if (success) return;
		throw new Error("Registration failed");
	}
}
