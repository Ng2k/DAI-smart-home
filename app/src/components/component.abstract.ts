/**
 * @file component.abstract.ts
 * @brief Abstract class for components
 * @author Nicola Guerra
 */
import { randomUUID } from "crypto";

import mqtt, { type MqttClient } from "mqtt";

import { MqttConfig, TimeUom, type Logger } from "../utils";

import type { IComponent } from "./component.interface";

export abstract class Component implements IComponent {
	protected readonly _mqttClient: MqttClient;
	protected readonly _timeUom: TimeUom = new TimeUom();

	constructor(_mqttConfigs: MqttConfig) {
		this._mqttClient = mqtt.connect(_mqttConfigs.url, {
			username: _mqttConfigs.username,
			password: _mqttConfigs.password
		});
	}

	public abstract start(): void;
	public abstract stop(): void;
}
