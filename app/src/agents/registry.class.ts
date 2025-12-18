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
	private readonly agents: Record<string, Record<string, string>> = {};

	protected override readonly logger: Logger;
	protected readonly topicToFunctionMap: Record<string, (message: string) => void> = {
		[Topics.REGISTRY_AGENTS]: this._handleAgentRegistration.bind(this),
	};

	constructor(
		config: RegistryConfig,
		mqttConfig: MqttConfig,
		mqttClient: MqttClient,
		dbClient: Database
	) {
		super(config, mqttConfig, mqttClient, dbClient);

		this.logger = logger.child({ name: this.constructor.name, id: this.config.id });

		super.subscribeToTopics(this.logger);
		super.startErrorListener(this.logger);
		super.startMessageListener(this.logger);

		this.logger.info(`Initializing ${config.type} agent`);
	}

	// private methods------------------------------------------------------------------------------
	private _handleAgentRegistration(message: string): void {
		const { id, name, type } = JSON.parse(message);
		if (!id || !name || !type) {
			this.logger.error({ message }, 'Invalid agent registration message');
			return;
		}
		if (this.agents[id]) {
			this.logger.error({ message }, 'Agent already registered');
			return;
		}
		this.agents[id] = { name, type };
		this.logger.debug({ agents: this.agents }, 'Agents registered');

		const payload = JSON.stringify({ success: true, id });
		const topic = this.config.pub_topics[0] || "";
		this.mqttClient.publish(topic, payload, (err, _) => {
			if (err) this.logger.error({ err }, "Error during the publishing");
			this.logger.info("Agent successfully registered");
		});
	}
}
