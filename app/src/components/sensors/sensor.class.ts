/**
 * @brief Sensor class
 * @file sensor.class.ts
 * @author Nicola Guerra
 */
import path from "path";

import logger, { type Logger } from "../../utils/logger";
import { Component } from "../component.class";
import { ComponentType, SensorType, type UnitOfMeasurement } from "../enums";

/**
 * This class represents a sensor component.
 * @class Sensor
 * @extends Component
 */
export class Sensor extends Component {
	protected _childLogger: Logger;

	constructor(
		public readonly name: SensorType,
		public readonly uom: UnitOfMeasurement,
		public readonly publish_interval_s: number,
		public readonly topic: string
	) {
		super(ComponentType.SENSOR);
		this._childLogger = logger.child({
			name: path.basename(__filename),
			sensor: this.toJSON()
		});
	}

	/**
	 * @brief Start the sensor
	 * @returns A promise that resolves when the sensor is started
	 */
	public async start(): Promise<void> {
		const logger = this._childLogger;


		setInterval(() => {
			const value = this._readValue();
			logger.debug({ value }, "Sensor value");
		}, this.publish_interval_s * 1000);

		logger.info("Sensor started successfully");
	}

	/**
	 * @brief Fake function to read the value of the sensor
	 * @returns The value of the sensor
	 */
	protected _readValue(): number {
		//todo: fake function to read the value of the sensor
		return Number((Math.random() * 100).toFixed(2));
	}

	public override toJSON(): Record<string, any> {
		const base = super.toJSON();
		return {
			...base,
			name: this.name,
			uom: this.uom,
			publish_interval_s: this.publish_interval_s
		};
	}
}
