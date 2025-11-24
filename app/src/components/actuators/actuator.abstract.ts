/**
 * @file actuator.interface.ts
 * @brief Interface for the actuators
 * @author Nicola Guerra
 */
import { Component } from "../component.abstract";
import { MqttConfig, type ActuatorConfig } from "../../utils";

export abstract class Actuator extends Component {
	constructor(
		protected readonly _config: ActuatorConfig,
		_mqttConfigs: MqttConfig,
	) {
		super(_mqttConfigs);

		const { room, type, topic: { subscribe } } = this._config;
		this._mqttClient.subscribe(subscribe, (error, granted) => {
			if (error) {
				this._logger.error(
					{ error },
					`Error subscribing to controller topic ${subscribe}`
				);
				return;
			}
			this._logger.debug({ granted }, `Actuator '${room}/${type}' subscribed to topic`);
		});

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

	public start(): void {
		this._mqttClient.on(
			'message',
			(topic, message) => this._onMessage(topic, message.toString())
		);
	}

	public stop(): void {
		const { room, type, topic: { subscribe } } = this._config;
		this._mqttClient.unsubscribe(subscribe);
		this._logger.info(`Actuator '${room}/${type}' stopped`);
	}

	// protected methods -----------------------------------------------------------------------------
	/**
	 * @brief Handle the message received from the controller topic
	 * @param topic The topic of the message received from the controller topic
	 * @param message The message received from the controller topic
	 * @returns void
	 */
	protected abstract _onMessage(topic: string, message: string): void;
}
