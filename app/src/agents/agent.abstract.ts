/**
 * @brief Agent abstract class file for the project
 * @file agent.abstract.ts
 * @author Nicola Guerra
 */
import mqtt, { type MqttClient } from "mqtt";

import type { AgentType } from "../utils/enums";
import type { Logger, MQTTConfig } from "../utils";
import type { IAgent } from "./agent.interface";

/**
 * @brief Agent abstract class
 * @class Agent
 */
export abstract class Agent implements IAgent {
	protected _mqttClient: MqttClient;

	constructor(
		public readonly name: string,
		public readonly type: AgentType,
		public readonly mqttConfigs: MQTTConfig,
		protected readonly _topics: string[],
		protected readonly _logger: Logger,
		public readonly id: string = crypto.randomUUID().toString(),
	) {
		this._mqttClient = mqtt.connect(mqttConfigs.brokerUrl, {
			username: mqttConfigs.username,
			password: mqttConfigs.password
		});

		this._startErrorListener();
		this._startMessageListener();
		this._subscribeToTopics();
	}

	// public methods ------------------------------------------------------------------------------
	public abstract toJSON(): Record<string, any>;
	public abstract toString(): string;

	// protected methods ---------------------------------------------------------------------------
	/**
	 * @brief Start the message listener
	 * @details This method starts the message listener for the MQTT client
	 * @returns void
	 */
	protected abstract _startMessageListener(): void;

	// private methods -----------------------------------------------------------------------------
	/**
	 * @brief Start the error listener
	 * @details This method starts the error listener for the MQTT client
	 * @returns void
	 */
	private _startErrorListener(): void {
		this._mqttClient.on('error', (error) => {
			this._logger.error({ error }, error.message);
		});
	}
	/**
	 * @brief Subscribe to topics
	 * @details This method subscribes to the topics for the agent
	 * @returns void
	 */
	private _subscribeToTopics(): void {
		this._topics.forEach((topic: string) => {
			this._mqttClient.subscribe(topic);
			this._logger.debug({ topic }, 'Subscribed to topic');
		});
	}
}
