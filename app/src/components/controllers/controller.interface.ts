/**
 * @brief Controller interface file for the project
 * @file controller.interface.ts
 * @author Nicola Guerra
 */
export interface IController {
	readonly id: string;

	/**
	 * @brief Start the controller
	 * @returns void
	 */
	start(): void;

	/**
	 * @brief Stop the controller
	 * @returns void
	 */
	stop(): void;

	/**
	 * @brief Convert the controller to a JSON object
	 * @returns A JSON object representing the controller
	 */
	toJSON(): Record<string, any>;

	/**
	 * @brief Convert the controller to a string
	 * @returns A string representing the controller
	 */
	toString(): string;
}
