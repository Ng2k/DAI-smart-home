/**
 * @brief Registry agent class file for the project
 * @file registry.class.ts
 * @author Nicola Guerra
 */
import { basename } from "path";

import { AgentType, logger, Topic, type MQTTConfig } from "../utils";
import { Agent } from "./agent.abstract";

/**
 * @brief Registry agent class
 * @class RegistryAgent
 */
export class RegistryAgent extends Agent {

	private readonly _agents: Record<string, Record<string, string>> = {};
	protected readonly _topicToFunctionMap: Record<string, (message: string) => void> = {
		[Topic.REGISTRY_AGENTS]: this._handleAgentRegistration.bind(this),
	};

	constructor(type: AgentType, mqttConfigs: MQTTConfig) {
		const _logger = logger.child({
			name: basename(__filename),
			agent_name: AgentType.REGISTRY
		});
		super(AgentType.REGISTRY, type, mqttConfigs, _logger);
		this._subscribeToTopics(Object.keys(this._topicToFunctionMap) as Topic[]);
		this._logger.info(`${this.name} agent initialized`);
	}

	// public methods-------------------------------------------------------------------------------
	public override toJSON(): Record<string, any> {
		return {
			id: this.id,
			name: this.name,
			type: this.type
		};
	}
	public override toString(): string {
		return `${this.id} - ${this.name} - ${this.type}`;
	}

	// private methods------------------------------------------------------------------------------
	private _handleAgentRegistration(message: string): void {
		const { id, name, type }: Record<string, string> = JSON.parse(message);
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
		this._mqttClient.publish(Topic.REGISTRY_AGENTS_ACK, payload);
		this._logger.debug(
			{ payload, topic: Topic.REGISTRY_AGENTS_ACK },
			'Response to the agent registration request'
		);
	}
}
