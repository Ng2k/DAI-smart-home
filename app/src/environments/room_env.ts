/**
 * @brief Room environment
 * @file room_env.ts
 * @author Nicola Guerra
 */
import { TemperatureModel, } from "./models/";

/**
 * @brief Class for handling room environments
 * @class RoomEnv
 */
export class RoomEnv {
	constructor(
		public readonly temperatureModel: TemperatureModel
	) { }

	// public methods --------------------------------------------------------------------------------
	/**
	 * @brief Update the sensors value
	 * @param dt {number}
	 * @return void
	 */
	public update(dt: number): void {
		this.temperatureModel.update(dt);
	}
}
