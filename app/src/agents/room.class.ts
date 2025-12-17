/**
 * @brief Room agent class file for the project
 * @file room.class.ts
 * @author Nicola Guerra
 */
import type { MqttClient } from "mqtt";

import { Agent } from "./agent.abstract.ts";
import { logger } from "../utils/index.ts";
import type { Logger, MqttConfig, RoomConfig } from "../utils/index.ts";

/**
 * @brief Room agent class
 * @class RoomAgent
 */
export class RoomAgent extends Agent {
	protected override readonly _topicToFunctionMap: Record<string, (message: string) => void> = {}
	private readonly _logger: Logger = logger.child({ name: this.constructor.name });

	constructor(agentConfig: RoomConfig, mqttClient: MqttClient) {
		super(agentConfig, mqttClient);

		this._logger.info(
			{ agent: `${agentConfig.type}/${agentConfig.room}` },
			"Initializing room agent"
		);
		this._subscribeToTopics();
		super._startErrorListener(this._logger);
		super._startMessageListener(this._logger);
	}

	// protected methods ---------------------------------------------------------------------------
	protected override _subscribeToTopics(): void {
		super._subscribeToTopics(this._logger);
	}
}
