/**
 * @brief Agent class
 * @file base_agent.class.ts
 * @author Nicola Guerra
 */
import mqtt from "mqtt";
import crypto from "crypto";

import type { IAgent } from "../interfaces/agent.interface";
import type { AgentClass, AgentType } from "../agent.enum";
import logger from "../../utils/logger";
import type { Logger } from "pino";

export class BaseAgent implements IAgent {
	readonly id: string;

	private childLogger: Logger;
	private mqttClient?: mqtt.MqttClient;
	private maxRetryAttempts: number = 3;
	private currentRetryAttempts: number = 0;

	constructor(
        readonly name: string,
        readonly type: AgentType,
        readonly agentClass: AgentClass,
	) {
		this.id = crypto.randomUUID();
		this.childLogger = logger.child({ agent: this.toJSON() });

		if (!Bun.env.MQTT_BROKER_URL) {
			const error = new Error("Missing MQTT_BROKER_URL environment variable");
			this.childLogger.error({ error }, error.message);
			return;
		}

		this.mqttClient = mqtt.connect(Bun.env.MQTT_BROKER_URL, {
			username: Bun.env.MQTT_USERNAME,
			password: Bun.env.MQTT_PASSWORD,
		});
		
		this.mqttClient.on("connect", () => {
			this.childLogger.info(`Connected to MQTT broker`);
		});

		this.mqttClient.on("error", (error) => {
			this.currentRetryAttempts++;
			if (this.currentRetryAttempts >= this.maxRetryAttempts) {
				this.childLogger.error('Max retry attempts reached. Giving up.');
				return;
			}
			this.childLogger.error({ error }, `MQTT connection error: ${error.message}`);
			this.childLogger.warn('No connection established to MQTT broker. Retrying...');
		});

		this.childLogger.info(`Agent initialized`);
	}

	/**
	 * @brief Convert the agent to a JSON object
	 * @returns A JSON object representing the agent
	 */
	toJSON(): Record<string, any> {
		return {
			id: this.id,
			name: this.name,
			type: this.type,
			agentClass: this.agentClass,
		};
	}

	/**
	 * @brief Convert the agent to a string
	 * @returns A string representing the agent
	 */
	toString(): string {
		return `Agent(id=${this.id}, name=${this.name}, type=${this.type}, agentClass=${this.agentClass})`;
	}
};
