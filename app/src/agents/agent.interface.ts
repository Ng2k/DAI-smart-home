/**
 * @brief Agent interface
 * @file agent.interface.ts
 * @author Nicola Guerra
 */
export interface IAgent {
	readonly id: string;
	readonly name: string;

	/**
	 * @brief Convert the agent to a JSON object
	 * @returns A JSON object representing the agent
	 */
	toJSON(): Record<string, any>;

	/**
	 * @brief Convert the agent to a string
	 * @returns A string representing the agent
	 */
	toString(): string;
}
