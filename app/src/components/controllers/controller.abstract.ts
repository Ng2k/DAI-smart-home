/**
 * @brief Controller abstract class file for the project
 * @file controller.abstract.ts
 * @author Nicola Guerra
 */
import { basename } from "path";
import { randomUUID } from "crypto";

import mqtt, { type MqttClient } from "mqtt";

import type { Logger, T_ControllerConfig, T_MqttConfig } from "../../utils";
import type { IController } from "./controller.interface";

/**
 * @brief Controller abstract class
 * @class Controller
 */
export abstract class Controller implements IController {
	public readonly id: string = randomUUID();
	protected readonly _mqttClient: MqttClient;
	protected abstract readonly _logger: Logger;

	constructor(
		protected readonly _controllerConfig: T_ControllerConfig,
		_mqttConfigs: T_MqttConfig,
	) {
		this._mqttClient = mqtt.connect(_mqttConfigs.url, {
			username: _mqttConfigs.username,
			password: _mqttConfigs.password
		});
	}

	// public methods ------------------------------------------------------------------------------
	public abstract start(): void;
	public abstract stop(): void;

	public toJSON(): Record<string, any> {
		return {
			id: this.id,
			controllerConfig: this._controllerConfig,
		};
	}

	public toString(): string {
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
