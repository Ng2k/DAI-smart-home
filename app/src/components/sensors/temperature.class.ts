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
	protected readonly logger: Logger;

	constructor(config: SensorConfig, mqttConfig: MqttConfig, env: RoomEnv) {
		super(config, mqttConfig, env);
		this.logger = logger.child({ name: this.constructor.name, sensor_id: config.id })
		this.logger.info({ sensor_id: this._config.id }, 'Sensor Initialized.');
	}

	// public methods ------------------------------------------------------------------------------
	public override start(): void {
		super.start(this.logger);
		this.logger.info('Sensor started');
	}
	public override stop(): void {
		super.stop(this.logger);
		this.logger.info('Sensor stopped.');
	}

	// protected methods ---------------------------------------------------------------------------
	protected _run(): Record<string, any> {
		return {
			id: this._config.id,
			uom: this._config.uom,
			value: this._env.temperatureModel.getValue()
		}
	}
}
