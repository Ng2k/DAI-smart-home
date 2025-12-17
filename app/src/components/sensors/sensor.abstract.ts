/**
 * @file sensor.abstract.ts
 * @brief Abstract class for sensors
 * @author Nicola Guerra
 */
import { type Packet } from "mqtt";

import { MqttConfig, type Logger, type SensorConfig } from "../../utils";
import { Component } from "../component.abstract";
import { RoomEnv } from "../../environments";

/**
 * @class Sensor
 * @brief abstract class for sensor
 */
export abstract class Sensor extends Component {
	constructor(
		protected readonly _config: SensorConfig,
		_mqttConfigs: MqttConfig,
		protected readonly _env: RoomEnv
	) {
		super(_mqttConfigs);
	}

	// public methods --------------------------------------------------------------------------------

	public start(logger: Logger): void {
		const { frequency, frequencyUom, topic } = this._config;
		const frequencyConverted = this._timeUom.convert(frequency, frequencyUom);

		setInterval(() => {
			const payload = this._run();
			this._mqttClient.publish(topic, JSON.stringify(payload), (err, _) => {
				if (err) {
					logger.error({ err }, "Error during the publishing of sensor value");
					return;
				}
				logger.info({ payload }, "Published sensor value");
			});
		}, frequencyConverted);
	}

	public stop(logger: Logger): void {
		const { topic } = this._config;
		this._mqttClient.unsubscribe(topic, (err: any, _: any) => {
			if (err) {
				logger.error({ err }, `Couldn't unsubscribe from the topic ${topic}`)
				return;
			}

			logger.info(`Successfully unsubscribed to the topic ${topic}`);
		});
	}

	// protected methods -----------------------------------------------------------------------------
	/**
	 * @brief Function for the creation of component values
	 * @return Record<string, any>
	 */
	protected abstract _run(): Record<string, any>;
}
