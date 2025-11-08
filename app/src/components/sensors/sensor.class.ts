/**
 * @brief Sensor class file for the project
 * @file sensor.class.ts
 * @author Nicola Guerra
 */
import { randomUUID } from "crypto";

import type { MqttClient } from "mqtt";

import { type Logger, SensorType } from "../../utils";

/**
 * @brief Sensor class
 * @class Sensor
 */
export class Sensor {
	protected readonly _id: string = randomUUID();

	constructor(
		public readonly type: SensorType,
		public readonly uom: string,
		public readonly publishFrequencySec: number,
		protected readonly _mqttClient: MqttClient,
		protected readonly _logger: Logger,
	) {}

	// protected methods ------------------------------------------------------------------------------
	protected _startComponent(): void {
		this._logger.info(`Sensor '${this.type}' started`);

		setInterval(() => {
			this._mqttClient.publish(`${this.type}/${this._id}/value`, this.value.toString());
		}, this.publishFrequencySec * 1000);
	}

	protected _stopComponent(): void {
		this._logger.info(`Sensor '${this.type}' stopped`);
		this._mqttClient.unsubscribe(`${this.type}/${this._id}/set`);
		this._mqttClient.unsubscribe(`${this.type}/${this._id}/get`);
	}

}
