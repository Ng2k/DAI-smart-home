/**
 * @brief File of the temperature controller class
 * @file humidity.class.ts
 * @author Nicola Guerra
 */
import { Controller } from "./controller.abstract";
import { type Logger, type ControllerConfig, MqttConfig } from "../../utils";
import { logger } from "../../utils";

/**
 * @brief Humidity controller class
 * @class HumidityController
 */
export class HumidityController extends Controller {
	protected override readonly _logger: Logger = logger.child({ name: this.constructor.name });
	private _dehumidifierState: boolean = false;

	constructor(config: ControllerConfig, mqttConfig: MqttConfig) {
		super(config, mqttConfig);
		this._logger.info({ config }, "Humidity controller initialized");
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

		const { dehumidifier } = payload;
		const { topic: { publish } } = this._config;

		if (dehumidifier === this._dehumidifierState) return;

		this._dehumidifierState = dehumidifier;
		this._mqttClient.publish(publish, JSON.stringify({ dehumidifier }))
		this._logger.debug(
			{ heater: this._dehumidifierState },
			`Command published to topic '${publish}' from controller '${room}/${type}'`
		)
	}
}
