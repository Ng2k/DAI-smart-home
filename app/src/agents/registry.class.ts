/**
 * @brief Registry agent class file for the project
 * @file registry.class.ts
 * @author Nicola Guerra
 */
import type { MqttClient } from "mqtt";

import { logger, Topics } from "../utils";
import type { Logger, MqttConfig, RegistryConfig, Database } from "../utils";
import { Agent } from "./agent.abstract";

/**
 * @brief Registry agent class
 * @class RegistryAgent
 */
export class RegistryAgent extends Agent {
	private readonly _agents: Record<string, Record<string, string>> = {};

	protected readonly _logger: Logger = logger.child({ name: this.constructor.name });
	protected readonly _topicToFunctionMap: Record<string, (message: string) => void> = {
		[Topics.REGISTRY_AGENTS]: this._handleAgentRegistration.bind(this),
	};

	constructor(
		agentConfig: RegistryConfig,
		mqttConfig: MqttConfig,
		mqttClient: MqttClient,
		dbClient: Database
	) {
		super(agentConfig, mqttConfig, mqttClient, dbClient);
		super._subscribeToTopics(this._logger);
		super._startErrorListener(this._logger);
		super._startMessageListener(this._logger);

		this._logger.info(`Initializing ${agentConfig.type} agent`);
	}

	// private methods------------------------------------------------------------------------------
	private _handleAgentRegistration(message: string): void {
		const { id, name, type } = JSON.parse(message);
		if (!id || !name || !type) {
			this._logger.error({ message }, 'Invalid agent registration message');
			return;
		}
		if (this._agents[id]) {
			this._logger.error({ message }, 'Agent already registered');
			return;
		}
		this._agents[id] = { name, type };
		this._logger.debug({ agents: this._agents }, 'Agents registered');

		const payload = JSON.stringify({ success: true, id });
		const topic = this._agentConfig.pub_topics[0] || "";
		this._mqttClient.publish(topic, payload, (err, _) => {
			if (err) this._logger.error({ err }, "Error during the publishing");
			this._logger.info("Agent successfully registered");
		});
	}
}
