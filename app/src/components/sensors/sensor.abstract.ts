/**
 * @file sensor.abstract.ts
 * @brief Abstract class for sensors
 * @author Nicola Guerra
 */
import type { Logger, T_MqttConfig, T_SensorConfig } from "../../utils";
import { Component } from "../component.abstract";

/**
 * @class Sensor
 * @brief abstract class for sensor
 */
export abstract class Sensor extends Component {
	constructor(
		protected override readonly _config: T_SensorConfig,
		_mqttConfigs: T_MqttConfig
	) {
		super(_config, _mqttConfigs);
	}

	// public methods --------------------------------------------------------------------------------

	public start(): void {
		const { room, type, frequency, frequencyUom, topic } = this._config;
		const frequencyConverted = this._timeUom.convert(frequency, frequencyUom);

		setInterval(() => {
			const payload = this._run();
			this._mqttClient.publish(topic, JSON.stringify(payload));
		}, frequencyConverted);
	}

	public stop(): void {
		const { room, type, topic } = this._config;
		this._mqttClient.unsubscribe(topic);
	}

	// protected methods -----------------------------------------------------------------------------
	/**
	 * @brief Function for the creation of component values
	 * @return Record<string, any>
	 */
	protected abstract _run(): Record<string, any>;
}
