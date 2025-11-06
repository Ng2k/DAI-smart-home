/**
 * @brief Sensor class
 * @file sensor.class.ts
 * @author Nicola Guerra
 */
import { Component } from "../component.class";
import { ComponentType, UnitOfMeasurement } from "../enums";

/**
 * This class represents a sensor component.
 * @class Sensor
 * @extends Component
 */
export class Sensor extends Component {
	constructor(name: string, uom: UnitOfMeasurement, topics: string[]) {
		super(name, ComponentType.SENSOR, uom, topics);
	}

	/**
	 * @brief Fake function to read the value of the sensor
	 * @returns The value of the sensor
	 */
	protected _readValue(): any {
		//todo: fake function to read the value of the sensor
		return Math.random() * 100;
	}
}
