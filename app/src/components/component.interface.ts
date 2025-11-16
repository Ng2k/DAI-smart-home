/**
 * @file component.interface.ts
 * @brief Interface for all the components (sensors, actuators, controllers)
 * @author Nicola Guerra
 */
export interface IComponent {
	/**
	 * @brief Start component processes
	 * @return void
	 */
	start(): void;
	/**
	 * @brief Stop component processes
	 * @return void
	 */
	stop(): void;
}
