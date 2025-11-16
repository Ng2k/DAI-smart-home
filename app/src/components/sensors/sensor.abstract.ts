/**
 * @file sensor.abstract.ts
 * @brief Abstract class for sensors
 * @author Nicola Guerra
 */
import { basename } from "path";
import { randomUUID } from "crypto";

import mqtt, { type MqttClient } from "mqtt";

import { logger, TimeUom } from "../../utils";
import type { Logger, T_MqttConfig, T_SensorConfig } from "../../utils";
import type { IComponent } from "../component.interface.ts"

/**
 * @class Sensor
 * @brief abstract class for sensor
 */
export abstract class Sensor implements IComponent {
	protected readonly _id: string = randomUUID();
	protected readonly _mqttClient: MqttClient;
	protected readonly _timeUom: TimeUom = new TimeUom();
	protected readonly _logger: Logger = logger.child({ name: basename(__filename) });

	constructor(
		protected readonly _sensorConfig: T_SensorConfig,
		_mqttConfigs: T_MqttConfig
	) {
		this._mqttClient = mqtt.connect(_mqttConfigs.url, {
			username: _mqttConfigs.username,
			password: _mqttConfigs.password
		});
		const { room, type } = this._sensorConfig;
		this._logger.info(`Sensor '${room}/${type}' initialized`);
	}

	// public methods --------------------------------------------------------------------------------

	public start(): void {
		const { room, type } = this._sensorConfig;
		const logger = this._logger;
		logger.info(`Sensor '${room}/${type}' started`);

		const frequency = this._sensorConfig.frequency;
		const frequencyUom = this._sensorConfig.frequencyUom;
		const frequencyConverted = this._timeUom.convert(frequency, frequencyUom);

		setInterval(() => {
			const payload = this._run();
			const debug = {
				topic: this._sensorConfig.topic,
				sensor_id: this._id,
				sensor_name: `${room}/${type}`,
				payload
			}
			this._mqttClient.publish(this._sensorConfig.topic, JSON.stringify(payload));
			logger.debug(debug, 'Sensor published value');
		}, frequencyConverted);
	}

	public stop(): void {
		const { room, type } = this._sensorConfig;
		this._logger.info(`Sensor '${room}/${type}' stopped`);
		this._mqttClient.unsubscribe(this._sensorConfig.topic);
	}

	// protected methods -----------------------------------------------------------------------------
	/**
	 * @brief Function for the creation of component values
	 * @return Record<string, any>
	 */
	protected abstract _run(): Record<string, any>;
}
