/**
 * @brief File for the class of the humidity sensor
 * @file humidity.class.ts
 * @author Nicola Guerra
 */
import { Sensor } from "@/components/sensors/sensor.abstract.ts";
import type { Logger, SensorConfig, MqttConfig } from "@/utils/";
import { logger, Database } from "@/utils/";
import { RoomEnv } from "@/environments/";

/**
 * @class HumiduitySensor
 * @brief Class for the humidity sensor
 */
export class HumiditySensor extends Sensor {
	protected override readonly logger: Logger;

	constructor(config: SensorConfig, mqttConfig: MqttConfig, database: Database, env: RoomEnv) {
		super(config, mqttConfig, database, env);
		this.logger = logger.child({ name: this.constructor.name, sensor_id: config.id });
		this.logger.info({ sensor_id: config.id }, 'Sensor Initialized.')
	}

	// protected methods ---------------------------------------------------------------------------
	protected run(): { value: number, uom: string } {
		return {
			value: this.env.humidityModel.getValue(),
			uom: this.config.uom
		};
	}
}
