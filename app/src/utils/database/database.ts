/**
 * @brief Module for database interactions
 * @file database.ts
 * @author Nicola Guerra
 */
import { SQL } from "bun"
import { logger, type Logger } from "../logger.ts"
import type { AgentConfig, RegistryConfig, RoomConfig } from "../types.ts";
import type { AgentComponentsDTO } from "./dtos/component.dto.ts";

/**
 * @class Database
 */
export class Database {
	static #instance: Database;
	private _client: SQL;
	private _logger: Logger = logger.child({ name: this.constructor.name })
	private _queryDir = `${__dirname}/queries`;

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
		const results = await this._client.file(`${this._queryDir}/get_registry.sql`);
		return results.values().toArray()[0];
	}

	/**
	 * @brief Returns all the agent configs
	 * @returns Promise<{ registry: RegistryConfig, rooms: RoomConfig }>
	 */
	public async getAgentConfigs(): Promise<{ registry: RegistryConfig, rooms: RoomConfig[] }> {
		const results = await this._client.file(`${this._queryDir}/get_all_agents.sql`);
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

	/**
	 * @brief Returns all the components for the specific agent
	 * @param id {string} unique identifier for the agent
	 * @return Agent components
	 */
	public async getAgentComponents(id: string): Promise<AgentComponentsDTO> {
		const query = `${this._queryDir}/get_all_agent_components.sql`;
		const results = await this._client.file(query, [id]);
		return results.values().toArray()[0].components;
	}

	/**
	 * @brief Insert the component reading into the database
	 * @param id {string} Component unique identifier
	 * @param component {string} Type of the component (sensor, actuator, controller...)
	 * @param payload {{ value: number, uom: string, created_by: string }} Reading
	 * @returns {Promise<void>} Echo of the record
	 */
	public async insertReading(
		id: string,
		component: string,
		payload: { value: number, uom: string, created_by: string }
	): Promise<object> {
		let query = `${this._queryDir}/insert_reading.sql`;
		const { value, uom, created_by } = payload;
		await this._client.file(query, [id, component, value, uom, created_by]);
		this._logger.info({ id, component }, "Component reading saved to database");

		query = `${this._queryDir}/get_reading.sql`;
		const results = await this._client.file(query, [id]);
		const row = results.values().toArray()[0]; this._logger.debug({ id, component, row }, "Reading saved");
		return row;
	}
};
