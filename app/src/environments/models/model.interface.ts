/**
 * @brief Interface for the models
 * @file model.interface.ts
 * @author Nicola Guerra
 */
export interface IModel {
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
