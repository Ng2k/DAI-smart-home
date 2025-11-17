/**
 * @brief Temperature controller class file for the project
 * @file temperature.class.ts
 * @author Nicola Guerra
 */
import { basename } from "path";

import { Controller } from "./controller.abstract";
import type { Logger, T_ControllerConfig, T_MqttConfig } from "../../utils";
import logger from "../../utils/logger";

/**
 * @brief Temperature controller class
 * @class TemperatureController
 */
export class TemperatureController extends Controller {
	protected readonly _logger: Logger = logger.child({ name: basename(__filename) });
	private _acState: boolean = false;

	constructor(config: T_ControllerConfig, mqttConfig: T_MqttConfig) {
		super(config, mqttConfig);

		const { room, type, topic: { subscribe } } = this._config;
		this._mqttClient.subscribe(subscribe, (error, granted) => {
			if (error) {
				this._logger.error(
					{ error },
					`Error subscribing to controller '${room}/${type}' topic ${subscribe}`
				);
				return;
			}
			this._logger.debug({ granted }, `Controller '${room}/${type}' subscribed to topic`);
		});

		this._logger.info({}, 'Controller Initialized.')
	}

	// public methods ------------------------------------------------------------------------------
	public start(): void {
		this._mqttClient.on(
			'message',
			(topic, message) => this._onMessage(topic, message.toString())
		);
	}

	public stop(): void {
		const { room, type, topic: { subscribe } } = this._config;
		this._mqttClient.unsubscribe(subscribe);
		this._logger.info(`Controller '${room}/${type}' stopped`);
	}

	// protected methods ---------------------------------------------------------------------------
	/**
	 * @brief Handle the message received from the controller topic
	 * @param topic The topic of the message received from the controller topic
	 * @param message The message received from the controller topic
	 * @returns void
	 */
	protected _onMessage(topic: string, message: string): void {
		const payload = JSON.parse(message);
		const { room, type } = this._config;
		this._logger.debug({ topic, payload }, `Message received from controller '${room}/${type}'`);

		const { value } = payload;
		const { topic: { publish } } = this._config;

		if (+value > 30 && !this._acState) this._acState = true;
		if (+value < 25 && this._acState) this._acState = false;

		this._mqttClient.publish(publish, JSON.stringify({ ac: this._acState }))
		this._logger.debug(
			{ ac: this._acState },
			`Command published to topic '${publish}' from controller '${room}/${type}'`
		)
	}
}
