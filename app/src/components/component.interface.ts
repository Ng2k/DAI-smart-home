import type { Logger } from "pino";

/**
 * @file component.interface.ts
 * @brief Interface for all the components (sensors, actuators, controllers)
 * @author Nicola Guerra
 */
export interface IComponent {
	/**
	 * @brief Start component processes
	 * @param logger {Logger} Class logger
	 * @return void
	 */
	start(logger: Logger): void;
	/**
	 * @brief Stop component processes
	 * @param logger {Logger} Class logger
	 * @return void
	 */
	stop(logger: Logger): void;
}
