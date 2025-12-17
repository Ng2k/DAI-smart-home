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
	protected readonly logger: Logger;

	constructor(config: SensorConfig, mqttConfig: MqttConfig, env: RoomEnv) {
		super(config, mqttConfig, env);
		this.logger = logger.child({ name: this.constructor.name, sensor_id: config.id });
		this.logger.info({ sensor_id: config.id }, 'Sensor Initialized.')
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
			value: this._env.humidityModel.getValue()
		}
	}
}
