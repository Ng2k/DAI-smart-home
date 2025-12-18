import type { Logger } from "pino";
import type { IModel } from "../environments";

/**
 * @file component.interface.ts
 * @brief Interface for all the components (sensors, actuators, controllers)
 * @author Nicola Guerra
 */
export interface IComponent {
	/**
	 * @brief Start component processes
	 * @param logger {Logger} Class logger
	 * @param envModel {IModel} Env simulator
	 * @return void
	 */
	start(logger: Logger, envModel: IModel): void;
	/**
	 * @brief Stop component processes
	 * @param logger {Logger} Class logger
	 * @return void
	 */
	stop(logger: Logger): void;
}
