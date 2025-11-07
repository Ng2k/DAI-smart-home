/**
 * @brief Registry agent class file for the project
 * @file registry.class.ts
 * @author Nicola Guerra
 */
import { basename } from "path";

import { AgentType, logger, type MQTTConfig } from "../utils";
import { Agent } from "./agent.abstract";

/**
 * @brief Registry agent class
 * @class RegistryAgent
 */
export class RegistryAgent extends Agent {
	constructor(type: AgentType, mqttConfigs: MQTTConfig, topics: string[]) {
		const _logger = logger.child({
			name: basename(__filename),
			agent_name: AgentType.REGISTRY
		});
		super(AgentType.REGISTRY, type, mqttConfigs, topics, _logger);
		this._logger.info(`${this.name} agent initialized`);
	}

	// public methods------------------------------------------------------------------------------
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

	// protected methods------------------------------------------------------------------------------
	protected override _startMessageListener(): void {
		this._mqttClient.on('message', (topic, message) => {
			this._logger.debug({ topic, message: JSON.parse(message.toString()) }, 'Message received');
		});
	}
}
