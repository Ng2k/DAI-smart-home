/**
 * @brief Sensor class file for the project
 * @file sensor.class.ts
 * @author Nicola Guerra
 */
import { basename } from "path";
import { randomUUID } from "crypto";

import mqtt, { type MqttClient } from "mqtt";

import { logger, TimeUom } from "../../utils";
import type { Logger, T_MqttConfig, T_SensorConfig } from "../../utils";
import { Sensor } from "./sensor.abstract";

/**
 * @brief Sensor class
 * @class Sensor
 */
export class TemperatureSensor extends Sensor {
	protected override readonly _logger: Logger = logger.child({ name: basename(__filename) });

	/** @inheritdoc */
	protected _run(): Record<string, any> {
		return {
			id: this._id,
			uom: this._sensorConfig.readUom,
			value: Number(Math.random() * 100).toFixed(2)
		}
	}
}
