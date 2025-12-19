/**
 * @file actuator.interface.ts
 * @brief Interface for the actuators
 * @author Nicola Guerra
 */
import { Component } from "@/components/component.abstract";
import { MqttConfig, Database, type ActuatorConfig } from "@/utils";

export abstract class Actuator extends Component {
	protected readonly config: ActuatorConfig;

	constructor(config: ActuatorConfig, mqttConfigs: MqttConfig, database: Database) {
		super(mqttConfigs, database);
		this.config = config;
	}

	// public methods ------------------------------------------------------------------------------
	public toJSON(): Record<string, any> {
		return this.config;
	}

	public override toString(): string {
		return JSON.stringify(this.toJSON());
	}

	public start(): void {
		this.mqttClient.subscribe(this.config.subTopics, (error, granted) => {
			if (error) {
				this.logger.error(
					{ error: error.stack },
					"Error subscribing to topics"
				);
				return;
			}
			this.logger.debug({ granted }, "Actuator subscribed to topic");
		});

		this.mqttClient.on(
			'message',
			(topic, message) => this._onMessage(topic, message.toString())
		);

		this.logger.info("Actuator started");
	}

	public stop(): void {
		this.mqttClient.unsubscribe(this.config.subTopics);
		this.logger.info("Actuator stopped");
	}

	// protected methods -----------------------------------------------------------------------------
	/**
	 * @brief Handle the message received from the controller topic
	 * @param topic The topic of the message received from the controller topic
	 * @param message The message received from the controller topic
	 * @returns void
	 */
	protected abstract _onMessage(topic: string, message: string): void;

	protected publish(topic: string, payload: { ack: boolean, value: boolean }): void {
		this.mqttClient.publish(topic, JSON.stringify(payload), (err, _) => {
			if (err) {
				this.logger.error({ err: err.stack }, "Error during the publishing of the ACK");
				return;
			}

			this.logger.info("ACK published");
		});
	}
}
