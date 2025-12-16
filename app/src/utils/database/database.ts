/**
 * @brief Module for database interactions
 * @file database.ts
 * @author Nicola Guerra
 */
import { SQL } from "bun"


import { logger, type Logger } from "../logger.ts"
import type { RegistryConfig } from "../types.ts";

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
};
