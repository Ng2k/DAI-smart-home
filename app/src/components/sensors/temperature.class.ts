/**
 * @brief Sensor class file for the project
 * @file sensor.class.ts
 * @author Nicola Guerra
 */
import { logger, MqttConfig, Database, type Logger, type SensorConfig } from "../../utils";
import { Sensor } from "./sensor.abstract";
import type { RoomEnv } from "../../environments";

/**
 * @brief Sensor class
 * @class Sensor
 */
export class TemperatureSensor extends Sensor {
	protected override readonly logger: Logger;

	constructor(config: SensorConfig, mqttConfig: MqttConfig, database: Database, env: RoomEnv) {
		super(config, mqttConfig, database, env);
		this.logger = logger.child({ name: this.constructor.name, sensor_id: config.id })
		this.logger.info({ sensor_id: this.config.id }, 'Sensor Initialized.');
	}

	// protected methods ---------------------------------------------------------------------------
	protected run(): { value: number, uom: string } {
		return {
			value: this.env.temperatureModel.getValue(),
			uom: this.config.uom
		};
	}
}
