/**
 * @brief Interface for the models
 * @file model.interface.ts
 * @author Nicola Guerra
 */
export interface IModel {
	/**
	 * @brief Set the value of the state property
	 * @param value {boolean} new value for the property
	 * @return void
	 */
	setState(state: boolean): void;
	/**
	 * @brief Update the value for the sensor
	 * @param dt {number} current value
	 * @return void
	 */
	update(dt: number): void;
	/**
	 * @brief Returns the value for the sensor
	 * @return number
	 */
	getValue(): number;
}
