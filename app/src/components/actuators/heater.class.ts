/**
 * @brief Actuator for the heater
 * @file heater.class.ts
 * @author Nicola Guerra
 */
import { logger, MqttConfig, type Logger, type ActuatorConfig } from "../../utils"
import { Actuator } from "./actuator.abstract";

export class HeaterActuator extends Actuator {
	protected readonly _logger: Logger = logger.child({ name: this.constructor.name });

	constructor(config: ActuatorConfig, mqttConfig: MqttConfig) {
		super(config, mqttConfig)
		this._logger.info({}, 'Heater actuator initialized.')
	}

	// protected methods ---------------------------------------------------------------------------
	/**
	 * @brief Handles the message received from the controller topic
	 * @param topic The topic of the message received from the controller topic
	 * @param message The message received from the controller topic
	 * @returns void
	 */
	protected _onMessage(topic: string, message: string): void {
		const { heater: value } = JSON.parse(message);
		const { room, type } = this._config;
		this._logger.debug({ topic, value }, `Message received from controller`);

		this._logger.info({}, 'Actuator is executing...');

		const { topic: { publish } } = this._config;
		this._mqttClient.publish(publish, JSON.stringify({ ack: true, value }))
		this._logger.debug(
			{ publish },
			`Actuator ${room}/${type} has executed command from controller`
		)
	}
}
