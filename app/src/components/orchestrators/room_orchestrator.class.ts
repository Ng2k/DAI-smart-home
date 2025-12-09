/**
 * @brief File for the room controller component
 * @file room.class.ts
 * @author Nicola Guerra
 */
import { logger, MqttConfig, type Logger, type OrchestratorConfig } from "../../utils/";
import { Component } from "../component.abstract";

/**
 * @brief Orchestrator for the room
 * @class RoomOrchestrator
 */
export class RoomOrchestrator extends Component {
	protected override _logger: Logger = logger.child({ name: this.constructor.name });

	constructor(private readonly _config: OrchestratorConfig, mqttConfig: MqttConfig) {
		super(mqttConfig);
		this._mqttClient.subscribe(_config.topic.subscribe || []);
		this._logger.info({ config: _config }, "Room orchestrator initialized");
	}

	// public methods ------------------------------------------------------------------------------
	public start(): void {
		this._mqttClient.on("message", (topic, message) => {
			this._logger.debug({ topic, message: JSON.parse(message.toString()) }, "Message received");
		});
		this._logger.debug({ sub: this._config.topic.subscribe }, "Room orchestrator subscribed to topics");
	}
	public stop(): void {
		const { room, type, topic: { subscribe } } = this._config;
		this._mqttClient.unsubscribe(subscribe || []);
		this._logger.info(`Orchestrator '${room}/${type}' stopped`);
	}
	// private methods -----------------------------------------------------------------------------
}
