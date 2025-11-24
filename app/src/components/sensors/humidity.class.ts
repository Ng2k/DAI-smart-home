/**
 * @brief File for the class of the humidity sensor
 * @file humidity.class.ts
 * @author Nicola Guerra
 */
import { Sensor } from "./sensor.abstract.ts";
import type { Logger, SensorConfig, MqttConfig } from "../../utils/";
import { logger } from "../../utils/";
import { RoomEnv } from "../../environments/";

/**
 * @class HumiduitySensor
 * @brief Class for the humidity sensor
 */
export class HumiditySensor extends Sensor {
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
		this._logger.info(
			{
				room: this._config.room,
				type: this._config.type
			},
			'Sensor stopped.'
		);
	}

	// protected methods -----------------------------------------------------------------------------
	protected _run(): Record<string, any> {
		return {
			id: this._id,
			uom: (this._config as SensorConfig).readUom,
			value: this._env.humidityModel.getValue()
		}
	}
}
