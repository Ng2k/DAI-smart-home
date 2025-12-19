/**
 * @brief MQTT configuration class
 * @file mqttConfig.ts
 * @author Nicola Guerra
 */
import { logger, type Logger } from "@/utils/logger"

export class MqttConfig {
	// public properties -----------------------------------------------------------------------------
	public readonly url: string = (Bun.env.MQTT_BROKER_URL || '').trim();
	public readonly username = (Bun.env.MQTT_USERNAME || '').trim();
	public readonly password = (Bun.env.MQTT_PASSWORD || '').trim();
	// private properties ----------------------------------------------------------------------------
	private logger: Logger = logger.child({ name: this.constructor.name });

	constructor() {
		if (!this.url) logger.warn("MQTT_BROKER_URL is not set. Set to empty string.");
		if (!this.username) logger.warn("MQTT_USERNAME is not set. Set to empty string.");
		if (!this.password) logger.warn("MQTT_PASSWORD is not set. Set to empty string.");

		this.logger.info("MQTT configuration initialized");
	}

	//public methods -------------------------------------------------------------------------------
	/**
	 * @brief Convert the MQTT configuration to a JSON object
	 * @returns T_MqttConfig
	 */
	public toJSON(): Record<string, any> {
		return { url: this.url, username: this.username, password: this.password };
	}
}
