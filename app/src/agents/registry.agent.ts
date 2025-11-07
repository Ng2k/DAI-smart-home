/**
 * @file registry.agent.ts
 * @brief Central registry agent that listens for room registration messages and stores them.
 * @author
 */
import { Agent } from "./agent.class";
import config from "../../config/agents.json";
import type { MQTTConfig } from "./types";

export class RegistryAgent extends Agent {
	private readonly agents: Map<string, Record<string, any>> = new Map();

	constructor(name: string, configs: MQTTConfig) {
		super(name, __filename, configs);
	}

	/**
	 * @brief Initializes the RegistryAgent by subscribing to registration topics.
	 * @returns void
	 */
	public override async initialize(): Promise<void> {
		super.initialize();

		try {
			await this.mqttClient.subscribeAsync(this.registrationTopic, { qos: 1 });
			this.childLogger.info(
				{ topic: this.registrationTopic },
				"Subscribed to registration topic"
			);
		} catch (error) {
			this.childLogger.error(
				{ error },
				(error instanceof Error) ? error.message : "Unknown error"
			);
			return;
		}

		this.mqttClient.on("message", async (topic, message) => {
			if (topic !== this.registrationTopic) return;

			try {
				const { id, name } = JSON.parse(message.toString());
				this.childLogger.debug({ topic }, "Received registration message");

				if (!(name in config.agents)) {
					this.childLogger.warn({ id, name }, "Agent not found in config, ignoring");
					return;
				}
				const agent = config.agents[name as keyof typeof config.agents];
				this.agents.set(id, agent);
				this.childLogger.debug({ agent }, "Agent found in config, creating instance");

				this.mqttClient.publishAsync(
					this.ackRegistrationTopic,
					JSON.stringify({ success: true, agent }),
					{ qos: 1 }
				);
			} catch (error) {
				this.mqttClient.publishAsync(
					this.ackRegistrationTopic,
					JSON.stringify({ success: false }),
					{ qos: 1 }
				);
				this.childLogger.error(
					{ error },
					(error instanceof Error) ? error.message : "Unknown error"
				);
			}
		});

		this.childLogger.info("RegistryAgent initialized and waiting for registrations");
	}
}
