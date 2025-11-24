/**
 * @brief Sensor class file for the project
 * @file sensor.class.ts
 * @author Nicola Guerra
 */
import { logger, MqttConfig, type Logger, type SensorConfig } from "../../utils";
import { Sensor } from "./sensor.abstract";
import type { RoomEnv } from "../../environments";

/**
 * @brief Sensor class
 * @class Sensor
 */
export class TemperatureSensor extends Sensor {
	protected override readonly _logger: Logger = logger.child({ name: this.constructor.name });

	constructor(config: SensorConfig, mqttConfig: MqttConfig, env: RoomEnv) {
		super(config, mqttConfig, env);
		this._logger.info({}, 'Sensor Initialized.')
	}

	// public methods --------------------------------------------------------------------------------
	public override start(): void {
		this._logger.debug(
			{
				room: this._config.room,
				type: this._config.type
			},
			'Starting sensor'
		)
		super.start();
		this._logger.info(
			{
				room: this._config.room,
				type: this._config.type
			},
			'Finish sensor operations'
		);
	}

	public override stop(): void {
		super.stop();
		this._logger.info({
			room: this._config.room,
			type: this._config.type
		}, 'Sensor stopped.');
	}

	// protected methods -----------------------------------------------------------------------------
	protected _run(): Record<string, any> {
		return {
			id: this._id,
			uom: (this._config as SensorConfig).readUom,
			value: this._env.temperatureModel.getValue()
		}
	}
}
