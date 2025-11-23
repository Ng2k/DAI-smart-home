/**
 * @brief Actuator for the heater
 * @file heater.class.ts
 * @author Nicola Guerra
 */
import { logger, type Logger, type T_ActuatorConfig, type T_MqttConfig } from "../../utils"
import { Actuator } from "./actuator.abstract";

export class HeaterActuator extends Actuator {
	protected readonly _logger: Logger = logger.child({ name: this.constructor.name });

	constructor(config: T_ActuatorConfig, mqttConfig: T_MqttConfig) {
		super(config, mqttConfig);

		const { room, type, topic: { subscribe } } = this._config;
		this._mqttClient.subscribe(subscribe, (error, granted) => {
			if (error) {
				this._logger.error(
					{ error },
					`Error subscribing to controller topic ${subscribe}`
				);
				return;
			}
			this._logger.debug({ granted }, `Actuator '${room}/${type}' subscribed to topic`);
		});

		this._logger.info({}, 'Actuator Initialized.')
	}

	// public methods --------------------------------------------------------------------------------
	public start(): void {
		this._mqttClient.on(
			'message',
			(topic, message) => this._onMessage(topic, message.toString())
		);
	}

	public stop(): void {
		const { room, type, topic: { subscribe } } = this._config;
		this._mqttClient.unsubscribe(subscribe);
		this._logger.info(`Actuator '${room}/${type}' stopped`);
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








