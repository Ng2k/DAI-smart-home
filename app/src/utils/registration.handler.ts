/**
 * @file registration.handler.ts
 * @brief Handles agent registration with retry and delay-based handshake.
 */

import type mqtt from "mqtt";
import type { Logger } from "./logger";

export interface RegistrationHandlerOptions {
	retryIntervalMs?: number;
	maxRetries?: number;
	qos?: 0 | 1 | 2;
}

export class RegistrationHandler {
	private readonly client: mqtt.MqttClient;
	private readonly logger: Logger;
	private readonly options: Required<RegistrationHandlerOptions>;

	constructor(client: mqtt.MqttClient, logger: Logger, options?: RegistrationHandlerOptions) {
		this.client = client;
		this.logger = logger.child({ module: "RegistrationHandler" });
		this.options = {
			retryIntervalMs: options?.retryIntervalMs ?? 2000,
			maxRetries: options?.maxRetries ?? 5,
			qos: options?.qos ?? 1,
		};
	}

	/**
	 * @brief Performs a registration attempt with retry and delay between attempts.
	 * @param registrationTopic Topic to publish registration message to.
	 * @param payload Registration payload.
	 */
	public async performRegistration(
		registrationTopic: string,
		payload: Record<string, unknown>
	): Promise<boolean> {
		let attempt = 0;

		while (attempt < this.options.maxRetries) {
			attempt++;
			this.logger.info({ attempt, registrationTopic }, "Publishing registration message...");

			try {
				const jsonPayload = JSON.stringify(payload);
				await this.client.publishAsync(registrationTopic, jsonPayload, { qos: this.options.qos });
			} catch (error) {
				this.logger.error({ error }, "Error publishing registration message");
			}

			this.logger.info(
				{ wait: this.options.retryIntervalMs },
				"Waiting before retrying registration..."
			);
			await new Promise((resolve) => setTimeout(resolve, this.options.retryIntervalMs));
		}

		this.logger.error("Max retries reached. Registration failed.");
		return false;
	}
}
