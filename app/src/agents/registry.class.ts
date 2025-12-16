/**
 * @brief Registry agent class file for the project
 * @file registry.class.ts
 * @author Nicola Guerra
 */
import { logger, Topics, MqttConfig, type Logger, type RegistryConfig } from "../utils";
import { Agent } from "./agent.abstract";

/**
 * @brief Registry agent class
 * @class RegistryAgent
 */
export class RegistryAgent extends Agent {
	private readonly _agents: Record<string, Record<string, string>> = {};

	protected readonly _topicToFunctionMap: Record<string, (message: string) => void> = {
		[Topics.REGISTRY_AGENTS]: this._handleAgentRegistration.bind(this),
	};
	protected override readonly _logger: Logger = logger.child({ name: this.constructor.name });

	constructor(agentConfig: RegistryConfig, mqttConfigs: MqttConfig) {
		super(agentConfig, mqttConfigs);
		this._logger.info(`Initializing ${agentConfig.type} agent`);
	}

	// public methods-------------------------------------------------------------------------------

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
		this._mqttClient.publish(Topics.REGISTRY_AGENTS_ACK, payload);
		this._logger.debug(
			{ payload, topic: Topics.REGISTRY_AGENTS_ACK },
			'Response to the agent registration request'
		);
	}
}
