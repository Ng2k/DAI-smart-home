/**
 * @brief Agent class
 * @file base_agent.class.ts
 * @author Nicola Guerra
 */
import crypto from "crypto";
import mqtt from "mqtt";

import logger from "../utils/logger";
import type { IAgent } from "./agent.interface";
import type { Logger } from "pino";
import type { MQTTConfig } from "./types";
import path from "path";
import type { Sensor } from "../components";

export class Agent implements IAgent {
	public readonly id: string = crypto.randomUUID();

	protected readonly childLogger: Logger;
	protected readonly registrationTopic: string = `${Bun.env.REGISTRY_TOPIC}/register`;
	protected readonly ackRegistrationTopic: string = `${Bun.env.REGISTRY_TOPIC}/ack`;
	protected readonly mqttConfigs: MQTTConfig;
	protected mqttClient: mqtt.MqttClient;
	protected _isConnected: boolean = false;
	protected _isRegistered: boolean = false;
	protected _sensors: Sensor[] = [];
	protected _actuators: [] = [];
	protected _controllers: [] = [];
	protected _type: string = "";

	private _maxRetryAttempts: number = 3;
	private _currentRetryAttempts: number = 0;


	constructor(
		public readonly name: string,
		filename: string,
		mqttConfigs: MQTTConfig
	) {
		this.childLogger = logger.child({ name: path.basename(filename) });
		this.mqttConfigs = mqttConfigs;
		this.mqttClient = mqtt.connect(
			mqttConfigs.brokerUrl,
			{ username: mqttConfigs.username, password: mqttConfigs.password }
		);
	}

	public async initialize(): Promise<void> {
		this.mqttClient.on('connect', () => {
			this.childLogger.info('Connected to the MQTT broker');
			this._isConnected = true;
		});

		this.mqttClient.on('error', (error) => {
			if (this._currentRetryAttempts >= this._maxRetryAttempts) {
				this.childLogger.error('Max retry attempts reached, closing mqtt connection');
				this.mqttClient.end();
				this._isConnected = false;
				return;
			}
			this._currentRetryAttempts++;
			this.childLogger.warn(
				{ currentRetryAttempts: this._currentRetryAttempts },
				'Reconnecting to the MQTT broker'
			);
		});

		this.mqttClient.on('disconnect', () => {
			this.childLogger.info('Disconnected from the MQTT broker');
			this._isConnected = false;
		});

		this.mqttClient.on('reconnect', () => {
			this.childLogger.info('Reconnected to the MQTT broker');
			this._isConnected = true;
		});
	}

	public toJSON(): Record<string, any> {
		return {
			id: this.id,
			name: this.name,
		};
	}

	public toString(): string { return JSON.stringify(this.toJSON()); }
};
