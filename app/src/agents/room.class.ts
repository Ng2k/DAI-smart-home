/**
 * @brief Room agent class file for the project
 * @file room.class.ts
 * @author Nicola Guerra
 */
import { basename } from "path"

import type { AgentType } from "../utils/enums";
import { Agent } from "./agent.abstract";
import { logger, Topic, type MQTTConfig } from "../utils";

/**
 * @brief Room agent class
 * @class RoomAgent
 */
export class RoomAgent extends Agent {
	private _isRegistered: boolean = false;
	protected override readonly  _topicToFunctionMap: Record<string, (message: string) => void> = {
		[Topic.REGISTRY_AGENTS_ACK]: this._handleRegistrationAck.bind(this),
	};

	/*
	private sensorManager: SensorManager;
	private actuatorManager: ActuatorManager;
	private controllerManager: ControllerManager;
	*/

	constructor(name: string, type: AgentType, mqttConfigs: MQTTConfig) {
		const _logger = logger.child({
			name: basename(__filename),
			agent_name: name
		});
		super(name, type, mqttConfigs, _logger);
		this._subscribeToTopics(Object.keys(this._topicToFunctionMap) as Topic[]);
		this._registerAgent();
		/*
		this.actuatorManager = new ActuatorManager();
		this.controllerManager = new ControllerManager(); */

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
	/**
	 * @brief Register the agent
	 * @details This method registers the agent with the registry
	 * @returns void
	 */
	private _registerAgent(): void {
		if (this._isRegistered) {
			this._logger.warn('Agent already registered');
			return;
		}

		const payload = JSON.stringify(this.toJSON());
		this._mqttClient.publish(Topic.REGISTRY_AGENTS, payload);
		this._logger.debug({ payload, topic: Topic.REGISTRY_AGENTS }, 'Requesting registration');
	}
	/**
	 * @brief Handle the registration acknowledgment
	 * @details This method handles the registration acknowledgment
	 * @param message The message to handle
	 * @returns void
	 */
	private _handleRegistrationAck(message: string): void {
		const { success, id }: Record<string, boolean | string> = JSON.parse(message);
		if (id !== this.id) {
			this._logger.warn(
				{ message },
				'Registration acknowledgment received for a different agent. Check subscriptions for this agent'
			);
			return;
		}
		if (!success || !id) {
			this._logger.error({ message }, 'Registration failed');
			return;
		}
		this._logger.info({ message }, 'Registration acknowledged by the registry');
		this._isRegistered = true;
	}
}
