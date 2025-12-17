/**
 * @file sensor.abstract.ts
 * @brief Abstract class for sensors
 * @author Nicola Guerra
 */
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

	// public methods ------------------------------------------------------------------------------
	public start(logger: Logger): void {
		const { frequency, frequencyUom, pubTopics } = this._config;
		const frequencyConverted = this._timeUom.convert(frequency, frequencyUom);

		setInterval(() => {
			const payload = this._run();
			this._mqttClient.publish(pubTopics[0], JSON.stringify(payload), (err, _) => {
				if (err) {
					logger.error({ err }, "Error during the publishing of sensor value");
					return;
				}
				logger.info({ payload }, "Published sensor value");
			});
		}, frequencyConverted);
	}

	public stop(logger: Logger): void {
		const { subTopics } = this._config;
		this._mqttClient.unsubscribe(subTopics, (err: any, _: any) => {
			if (err) {
				logger.error({ err }, `Couldn't unsubscribe from the topic ${subTopics}`)
				return;
			}

			logger.info(`Successfully unsubscribed to the topic ${subTopics}`);
		});
	}

	// protected methods ---------------------------------------------------------------------------
	/**
	 * @brief Function for the creation of component values
	 * @return Record<string, any>
	 */
	protected abstract _run(): Record<string, any>;
}
