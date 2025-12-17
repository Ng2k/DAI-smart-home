/**
 * @brief Module for database interactions
 * @file database.ts
 * @author Nicola Guerra
 */
import { SQL } from "bun"


import { logger, type Logger } from "../logger.ts"
import type {
	AgentConfig,
	RegistryConfig, RoomConfig } from "../types.ts";

/**
 * @class Database
 */
export class Database {
	static #instance: Database;
	private _client: SQL;
	private _logger: Logger = logger.child({ name: this.constructor.name })

	private constructor() {
		this._client = new SQL(Bun.env.DATABASE_URL || "");
		this._logger.info("Database instance created");
	}

	// public methods ------------------------------------------------------------------------------
	/**
	 * @brief Static getter that controls access to the instance
	 * @returns Database
	 */
	public static getInstance(): Database {
		if (!Database.#instance) {
			Database.#instance = new Database();
		}

		return Database.#instance;
	}

	public async getRegistry(): Promise<RegistryConfig> {
		const results = await this._client.file(`${__dirname}/queries/get_registry.sql`);
		return results.values().toArray()[0];
	}

	/**
	 * @brief Returns all the agent configs
	 * @returns Promise<{ registry: RegistryConfig, rooms: RoomConfig }>
	 */
	public async getAgentConfigs(): Promise<{ registry: RegistryConfig, rooms: RoomConfig[] }> {
		const results = await this._client.file(`${__dirname}/queries/get_all_agents.sql`);
		const resultsList = results.values().toArray();
		return resultsList.reduce(
			(
				acc: Record<string, RegistryConfig | RoomConfig[]>,
				agent: AgentConfig
			) => {
				if (agent.type === 'registry') {
					acc.registry = agent as RegistryConfig;
				}

				if (agent.type === 'room') {
					(acc.rooms as RoomConfig[]).push(agent as RoomConfig);
				}

				return acc;
			},
			{ registry: {}, rooms: [] }
		);
	}
};
