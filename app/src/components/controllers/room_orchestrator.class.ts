/**
 * @brief File for the room controller component
 * @file room.class.ts
 * @author Nicola Guerra
 */
import { Controller } from "./controller.abstract";
import { logger, type Logger, type ControllerConfig, MqttConfig } from "../../utils/";

/**
 * @brief Orchestrator for the controllers of a room
 * @class RoomController
 */
export class RoomOrchestrator {
	private _controllers: Controller[] = [];
	private readonly _logger: Logger = logger.child({ name: this.constructor.name });

	constructor(config: OrchestratorConfig, mqttConfig: MqttConfig) {
		this._logger.info({ config }, "Room controller initialized");
	}

	// public methods --------------------------------------------------------------------------------
	// private methods -------------------------------------------------------------------------------
}
