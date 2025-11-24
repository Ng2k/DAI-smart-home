/**
 * @brief Temperature controller class file for the project
 * @file temperature.class.ts
 * @author Nicola Guerra
 */
import { Controller } from "./controller.abstract";
import { logger, MqttConfig, type Logger, type ControllerConfig } from "../../utils";

/**
 * @brief Temperature controller class
 * @class TemperatureController
 */
export class TemperatureController extends Controller {
	protected override readonly _logger: Logger = logger.child({ name: this.constructor.name });
	private _heaterState: boolean = false;

	constructor(config: ControllerConfig, mqttConfig: MqttConfig) {
		super(config, mqttConfig);
		this._logger.info({ config }, "Temperature controller initialized");
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
		let newState = this._heaterState;

		const isCold = (+value < 20 && !this._heaterState);
		const isHot = (+value > 22 && this._heaterState)
		if (isCold || isHot) newState = !this._heaterState;

		if (newState === this._heaterState) return;

		this._heaterState = newState;
		this._mqttClient.publish(publish, JSON.stringify({ heater: newState }))
		this._logger.debug(
			{ heater: this._heaterState },
			`Command published to topic '${publish}' from controller '${room}/${type}'`
		)
	}
}
