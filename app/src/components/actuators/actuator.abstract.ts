/**
 * @file actuator.interface.ts
 * @brief Interface for the actuators
 * @author Nicola Guerra
 */
import { Component } from "../component.abstract";
import type { T_ActuatorConfig, T_MqttConfig } from "../../utils";

export abstract class Actuator extends Component {
	constructor(
		protected override readonly _config: T_ActuatorConfig,
		_mqttConfigs: T_MqttConfig,
	) {
		super(_config, _mqttConfigs);
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
}
