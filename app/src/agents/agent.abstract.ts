/**
 * @brief Agent abstract class file for the project
 * @file agent.abstract.ts
 * @author Nicola Guerra
 */
import mqtt, { type MqttClient } from "mqtt";

import { AgentType } from "../utils";
import type { Logger, T_MqttConfig} from "../utils"
import type { IAgent } from "./agent.interface";

/**
 * @brief Agent abstract class
 * @class Agent
 */
export abstract class Agent implements IAgent {
	protected _mqttClient: MqttClient;
	protected abstract readonly _topicToFunctionMap: Record<string, (message: string) => void>;

	constructor(
		public readonly name: string,
		public readonly type: AgentType,
		public readonly mqttConfigs: T_MqttConfig,
		protected readonly _logger: Logger,
		public readonly id: string = crypto.randomUUID().toString(),
	) {
		this._mqttClient = mqtt.connect(mqttConfigs.url, {
			username: mqttConfigs.username,
			password: mqttConfigs.password
		});

		this._startErrorListener();
		this._startMessageListener();
	}

	// public methods ------------------------------------------------------------------------------
	public abstract toJSON(): Record<string, any>;
	public abstract toString(): string;

	// protected methods ---------------------------------------------------------------------------
	/**
	 * @brief Subscribe to topics
	 * @details This method subscribes to the topics for the agent
	 * @returns void
	 */
	protected _subscribeToTopics(): void {
		Object.keys(this._topicToFunctionMap).forEach(topic => {
			this._mqttClient.subscribe(topic);
			this._logger.debug({ topic }, 'Subscribed to topic');
		});
	}

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
	 * @brief Start the message listener
	 * @details This method starts the message listener for the MQTT client
	 * @returns void
	 */
	private _startMessageListener(): void {
		this._mqttClient.on('message', (topic, message) => {
			const payload = message.toString();
			this._logger.debug({ topic, message: JSON.parse(payload) }, 'Message received');

			const functionToCall = this._topicToFunctionMap[topic];
			if (!functionToCall) return;

			functionToCall(payload);
			this._logger.info({ payload }, 'Operation for the topic completed successfully');
		});
	}
}
