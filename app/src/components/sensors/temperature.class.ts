/**
 * @brief Sensor class file for the project
 * @file sensor.class.ts
 * @author Nicola Guerra
 */
import { basename } from "path";

import { logger } from "../../utils";
import type { Logger, T_MqttConfig, T_SensorConfig } from "../../utils";
import { Sensor } from "./sensor.abstract";

/**
 * @brief Sensor class
 * @class Sensor
 */
export class TemperatureSensor extends Sensor {
	protected readonly _logger: Logger = logger.child({ name: basename(__filename) });

	constructor(config: T_SensorConfig, mqttConfig: T_MqttConfig) {
		super(config, mqttConfig);
		this._logger.info({}, 'Sensor Initialized.')
	}

	public override start(): void {
		this._logger.debug(
			{
				room: this._config.room,
				type: this._config.type
			},
			'Starting sensor'
		)
		super.start();
		this._logger.info({
			room: this._config.room,
			type: this._config.type
		}, 'Finish sensor operations');
	}

	public override stop(): void {
		super.stop();
		this._logger.info({
			room: this._config.room,
			type: this._config.type
		}, 'Sensor stopped.');
	}

	/** @inheritdoc */
	protected _run(): Record<string, any> {
		return {
			id: this._id,
			uom: (this._config as T_SensorConfig).readUom,
			value: Number(Math.random() * 100).toFixed(2)
		}
	}
}
