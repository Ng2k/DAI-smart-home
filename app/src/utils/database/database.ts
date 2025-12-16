/**
 * @brief Module for database interactions
 * @file database.ts
 * @author Nicola Guerra
 */
import { SQL } from "bun"

import { logger, type Logger } from "../logger.ts"

/**
 * @class Database
 */
export class Database {
	private _client: SQL;
	private _logger: Logger = logger.child({ name: this.constructor.name })

	constructor() {
		this._client = new SQL(Bun.env.DATABASE_URL || "");
	}

	public async getSensor(type: string, room: string): Promise<void> {
		const result = await this._client.file(`${__dirname}/queries/get_sensor.sql`, [type, room]);
		console.log(result);
	}
};

















































