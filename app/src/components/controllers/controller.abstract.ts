/**
 * @brief Controller abstract class file for the project
 * @file controller.abstract.ts
 * @author Nicola Guerra
 */
import type { T_ControllerConfig, T_MqttConfig } from "../../utils";
import { Component } from "../component.abstract";

/**
 * @brief Controller abstract class
 * @class Controller
 */
export abstract class Controller extends Component {
	constructor(
		protected readonly _config: T_ControllerConfig,
		_mqttConfigs: T_MqttConfig,
	) {
		super(_mqttConfigs);
	}

	// public methods ------------------------------------------------------------------------------
	public toJSON(): Record<string, any> {
		return {
			id: this._id,
			config: this._config,
		};
	}

	public override toString(): string {
		return JSON.stringify(this.toJSON());
	}

	// protected methods ---------------------------------------------------------------------------
	/**
	 * @brief Handle the message received from the controller topic
	 * @param topic The topic of the message received from the controller topic
	 * @param message The message received from the controller topic
	 * @returns void
	 */
	protected abstract _onMessage(topic: string, message: string): void;
}
