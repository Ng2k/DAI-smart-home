/**
 * @brief File for the room controller component
 * @file room.class.ts
 * @author Nicola Guerra
 */
import { logger, MqttConfig, type Logger, type OrchestratorConfig } from "../../utils/";
import type { Controller } from "..";

/**
 * @brief Orchestrator for the room
 * @class RoomOrchestrator
 */
export class RoomOrchestrator {
	private _controllers: Controller[] = [];
	private readonly _logger: Logger = logger.child({ name: this.constructor.name });

	constructor(config: OrchestratorConfig, mqttConfig: MqttConfig) {
		this._logger.info({ config }, "Room orchestrator initialized");
	}

	// public methods ------------------------------------------------------------------------------
	// private methods -----------------------------------------------------------------------------
}
