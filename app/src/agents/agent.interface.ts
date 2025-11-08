/**
 * @brief Agent interface file for the project
 * @file agent.interface.ts
 * @author Nicola Guerra
 */

/**
 * @brief Agent interface
 * @interface IAgent
 */
export interface IAgent {
	readonly id: string;
	readonly agentConfig: Record<string, any>;

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
