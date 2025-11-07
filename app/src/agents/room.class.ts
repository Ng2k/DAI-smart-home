/**
 * @brief Room agent class file for the project
 * @file room.class.ts
 * @author Nicola Guerra
 */
import { basename } from "path"

import type { AgentType } from "../utils/enums";
import { Agent } from "./agent.abstract";
import { logger, type MQTTConfig } from "../utils";

/**
 * @brief Room agent class
 * @class RoomAgent
 */
export class RoomAgent extends Agent {
	private _isRegistered: boolean = false;

	/*
	private sensorManager: SensorManager;
	private actuatorManager: ActuatorManager;
	private controllerManager: ControllerManager;
	*/

	constructor(name: string, type: AgentType, mqttConfigs: MQTTConfig, topics: string[]) {
		const _logger = logger.child({
			name: basename(__filename),
			agent_name: name
		});
		super(name, type, mqttConfigs, topics, _logger);

		this._registerAgent();

		/* this.sensorManager = new SensorManager();
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

	// protected methods------------------------------------------------------------------------------
	protected override _startMessageListener(): void {
		this._mqttClient.on('message', (topic, message) => {
			this._logger.debug({ topic, message }, 'Message received');
		});
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
		this._mqttClient.publish(`${Bun.env.MQTT_REGISTRY}/agents`, payload);
		this._logger.debug({ payload }, 'Requesting registration');
	}
}
