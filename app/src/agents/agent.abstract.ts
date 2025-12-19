/**
 * @brief Agent abstract class file for the project
 * @file agent.abstract.ts
 * @author Nicola Guerra
 */
import { type MqttClient } from "mqtt";

import { AgentType } from "@/utils";
import type { Logger, AgentConfig, Database, MqttConfig, RoomConfig } from "@/utils"
import type { IAgent } from "@/agents/agent.interface";

/**
 * @brief Agent abstract class
 * @class Agent
 */
export abstract class Agent implements IAgent {
	protected abstract readonly logger: Logger;
	protected abstract readonly topicToFunctionMap: Record<string, (message: string) => void>;

	constructor(
		protected readonly config: AgentConfig,
		protected readonly mqttConfig: MqttConfig,
		protected readonly mqttClient: MqttClient,
		protected readonly dbClient: Database
	) { }

	// public methods ------------------------------------------------------------------------------
	public toJSON(): Record<string, any> {
		return { ...this.config };
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
	protected subscribeToTopics(logger: Logger): void {
		const topics = this.config.sub_topics;
		const type = this.config.type;

		const logOpts = { topics, agent: '' };
		if (type === AgentType.REGISTRY) logOpts.agent = AgentType.REGISTRY;
		else logOpts.agent = `${type}/${(this.config as RoomConfig).room}`;

		if (topics.length === 0) {
			logger.warn({ ...logOpts }, "This agent has no topics to subscribed to");
			return;
		}

		this.mqttClient.subscribe(topics, (err, granted) => {
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
	protected startErrorListener(logger: Logger): void {
		this.mqttClient.on('error', (error) => {
			let msg = "";
			const { code } = error as Record<string, any>;
			if (code === "ECONNREFUSED") msg = "Connection error to the mqtt server";
			logger.error(msg);
			this.mqttClient.end();
		});
	}
	/**
	 * @brief Start the message listener
	 * @details This method starts the message listener for the MQTT client
	 * @returns void
	 */
	protected startMessageListener(logger: Logger): void {
		this.mqttClient.on('message', (topic, message) => {
			const payload = message.toString();
			logger.debug({ topic, message: JSON.parse(payload) }, 'Message received');

			const functionToCall = this.topicToFunctionMap[topic];
			if (!functionToCall) return;

			functionToCall(payload);
			logger.info(
				{ payload: JSON.parse(payload) },
				'Operation for the topic completed successfully'
			);
		});
	}
}
