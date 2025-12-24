/**
 * @brief Handler for mqtt connections
 * @file mqtt.ts
 * @author Nicola Guerra
 */
import mqtt, { type MqttClient } from "mqtt";

import { logger, type Logger } from "@/libs/logger.ts";

/**
 * @class Mqtt
 * @classdesc Handler class for mqtt clients. Using Singleton as pattern
 */
export class Mqtt {
	static #instance: Mqtt;

	private readonly url: string;
	private readonly username: string;
	private readonly password: string;
	private readonly logger: Logger = logger.child({ name: this.constructor.name })

	private constructor() {
		this.url = Bun.env.MQTT_BROKER_URL || '';
		this.username = Bun.env.MQTT_USERNAME || '';
		this.password = Bun.env.MQTT_PASSWORD || '';

		this.validateEnvVars('MQTT_BROKER_URL', this.url);
		this.validateEnvVars('MQTT_USERNAME', this.username);
		this.validateEnvVars('MQTT_PASSWORD', this.password);
	}

	// public methods ------------------------------------------------------------------------------
	/**
	 * @brief Returns the instance of the Mqtt
	 * @return {Mqtt} Class istance
	 */
	public static getInstance(): Mqtt {
		if (!this.#instance) this.#instance = new Mqtt();
		return this.#instance;
	}

	/**
	* @brief Create a new client to the mqtt server
	* @returns {MqttClient} Client mqtt
	*/
	public async createClient(componentId: string): Promise<MqttClient> {
		try {
			const client = await mqtt.connectAsync(
				this.url,
				{ username: this.username, password: this.password }
			);
			this.logger.info({ component_id: componentId }, "Create new mqtt client");
			return client;
		} catch (error) {
			this.logger.error({ error }, "Error connecting to the mqtt broker")
			throw error;
		}
	}

	// private methods -----------------------------------------------------------------------------
	private validateEnvVars(name: string, value: string | undefined): void {
		if (value || value!.trim()) return;

		this.logger.warn(`Env variable ${name} is empty or missing.`);
	}
}
