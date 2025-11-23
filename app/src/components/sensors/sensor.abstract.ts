/**
 * @file sensor.abstract.ts
 * @brief Abstract class for sensors
 * @author Nicola Guerra
 */
import type { T_MqttConfig, T_SensorConfig } from "../../utils";
import { Component } from "../component.abstract";
import { RoomEnv } from "../../environments";

/**
 * @class Sensor
 * @brief abstract class for sensor
 */
export abstract class Sensor extends Component {
	constructor(
		protected readonly _config: T_SensorConfig,
		_mqttConfigs: T_MqttConfig,
		protected readonly _env: RoomEnv
	) {
		super(_mqttConfigs);
	}

	// public methods --------------------------------------------------------------------------------

	public start(): void {
		const { frequency, frequencyUom, topic } = this._config;
		const frequencyConverted = this._timeUom.convert(frequency, frequencyUom);

		setInterval(() => {
			const payload = this._run();
			this._mqttClient.publish(topic, JSON.stringify(payload));
		}, frequencyConverted);
	}

	public stop(): void {
		const { topic } = this._config;
		this._mqttClient.unsubscribe(topic);
	}

	// protected methods -----------------------------------------------------------------------------
	/**
	 * @brief Function for the creation of component values
	 * @return Record<string, any>
	 */
	protected abstract _run(): Record<string, any>;
}
