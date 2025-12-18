/**
 * @brief Actuator for the dehumidifier
 * @file dehumidifier.class.ts
 * @author Nicola Guerra
 */
import { Database, logger, MqttConfig, type Logger, type ActuatorConfig } from "../../utils"
import { Actuator } from "./actuator.abstract";

export class DehumidifierActuator extends Actuator {
	protected readonly logger: Logger;

	constructor(config: ActuatorConfig, mqttConfig: MqttConfig, database: Database) {
		super(config, mqttConfig, database)
		this.logger = logger.child({ name: this.constructor.name, id: this.config.id });
		this.logger.info("Dehumidifier actuator initialized.")
	}

	// protected methods ---------------------------------------------------------------------------
	/**
	 * @brief Handles the message received from the controller topic
	 * @param topic The topic of the message received from the controller topic
	 * @param message The message received from the controller topic
	 * @returns void
	 */
	protected _onMessage(topic: string, message: string): void {
		this.logger.info({ topic }, "Message received");

		const { dehumidifier: value } = JSON.parse(message);
		this.logger.info(`Dehumidifier turned ${value ? "on" : "off"}`);

		this.mqttClient.publish(this.config.pubTopics[0], JSON.stringify({ ack: true, value }))
		this.logger.debug("Publish ACK");
	}
}
