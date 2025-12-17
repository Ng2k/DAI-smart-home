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
	protected readonly _logger: Logger = logger.child({ name: this.constructor.name });

	constructor(config: SensorConfig, mqttConfig: MqttConfig, env: RoomEnv) {
		super(config, mqttConfig, env);
		this._logger.info({ sensor_id: this._config.id }, 'Sensor Initialized.');
	}

	// public methods --------------------------------------------------------------------------------
	public override start(): void {
		this._logger.info({ sensor_id: this._config.id }, 'Starting sensor');
		super.start(this._logger);
	}
	public override stop(): void {
		super.stop(this._logger);
		this._logger.info({ sensor_id: this._config.id }, 'Sensor stopped.');
	}

	// protected methods -----------------------------------------------------------------------------
	protected _run(): Record<string, any> {
		return {
			id: this._config.id,
			uom: this._config.uom,
			value: this._env.temperatureModel.getValue()
		}
	}
}
