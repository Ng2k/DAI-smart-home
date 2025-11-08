/**
 * @brief MQTT configuration class
 * @file mqttConfig.ts
 * @author Nicola Guerra
 */
//std imports --------------------------------------------------------------------------------------
import { basename } from "path"
//project imports ----------------------------------------------------------------------------------
import logger, { type Logger } from "./logger"
import type { T_MqttConfig } from "./types";

export class MqttConfig {
	private url: string;
	private username: string;
	private password: string;
	private logger: Logger;

	constructor() {
		this.logger = logger.child({ name: basename(__filename) });
		this.url = (Bun.env.MQTT_BROKER_URL || '').trim();
		this.username = (Bun.env.MQTT_USERNAME || '').trim();
		this.password = (Bun.env.MQTT_PASSWORD || '').trim();

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
	public toJSON(): T_MqttConfig {
		return { url: this.url, username: this.username, password: this.password };
	}
}
