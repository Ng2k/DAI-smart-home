/**
 * @brief Agent abstract class file for the project
 * @file agent.abstract.ts
 * @author Nicola Guerra
 */
import { type MqttClient } from "mqtt";

import { AgentType } from "../utils";
import type { Logger, AgentConfig, Database, MqttConfig, RoomConfig } from "../utils"
import type { IAgent } from "./agent.interface";

/**
 * @brief Agent abstract class
 * @class Agent
 */
export abstract class Agent implements IAgent {
	protected abstract readonly _topicToFunctionMap: Record<string, (message: string) => void>;

	constructor(
		protected readonly _agentConfig: AgentConfig,
		protected readonly _mqttConfig: MqttConfig,
		protected readonly _mqttClient: MqttClient,
		protected readonly _dbClient: Database
	) { }

	// public methods ------------------------------------------------------------------------------
	public toJSON(): Record<string, any> {
		return { ...this._agentConfig };
	}
	public toString(): string {
		return JSON.stringify(this.toJSON(), null, 2);
	}

	// protected methods ---------------------------------------------------------------------------
	/**
	 * @brief Subscribe to topics
	 * @details This method subscribes to the topics for the agent
	 * @returns void
	 */
	protected _subscribeToTopics(logger: Logger): void {
		const topics = this._agentConfig.sub_topics;
		const type = this._agentConfig.type;

		const logOpts = { topics, agent: '' };
		if (type === AgentType.REGISTRY) logOpts.agent = AgentType.REGISTRY;
		else logOpts.agent = `${type}/${(this._agentConfig as RoomConfig).room}`;

		if (topics.length === 0) {
			logger.warn({ ...logOpts }, "This agent has no topics to subscribed to");
			return;
		}

		this._mqttClient.subscribe(topics, (err, granted) => {
			if (err) logger.error({ err }, "Error during subscription");
			if (!granted) return;

			logger.info({ ...logOpts }, "Completed subscription for topics");
		});
	}
	/**
	 * @brief Start the error listener
	 * @details This method starts the error listener for the MQTT client
	 * @returns void
	 */
	protected _startErrorListener(logger: Logger): void {
		this._mqttClient.on('error', (error) => {
			let msg = "";
			const { code } = error as Record<string, any>;
			if (code === "ECONNREFUSED") msg = "Connection error to the mqtt server";
			logger.error(msg);
			this._mqttClient.end();
		});
	}
	/**
	 * @brief Start the message listener
	 * @details This method starts the message listener for the MQTT client
	 * @returns void
	 */
	protected _startMessageListener(logger: Logger): void {
		this._mqttClient.on('message', (topic, message) => {
			const payload = message.toString();
			logger.debug({ topic, message: JSON.parse(payload) }, 'Message received');

			const functionToCall = this._topicToFunctionMap[topic];
			if (!functionToCall) return;

			functionToCall(payload);
			logger.info({ payload: JSON.parse(payload) }, 'Operation for the topic completed successfully');
		});
	}
}
