/**
 * @file sensor.abstract.ts
 * @brief Abstract class for sensors
 * @author Nicola Guerra
 */
import { MqttConfig, Database, type Logger, type SensorConfig } from "../../utils";
import { Component } from "../component.abstract";
import { RoomEnv, type IModel } from "../../environments";

/**
 * @class Sensor
 * @brief abstract class for sensor
 */
export abstract class Sensor extends Component {
	protected readonly config: SensorConfig;
	protected readonly env: RoomEnv;

	constructor(config: SensorConfig, mqttConfigs: MqttConfig, database: Database, env: RoomEnv) {
		super(mqttConfigs, database);
		this.config = config;
		this.env = env;
	}

	// public methods ------------------------------------------------------------------------------
	public start(logger: Logger, envModel: IModel): void {
		const { frequency, frequencyUom, pubTopics } = this.config;
		const frequencyConverted = this.timeUom.convert(frequency, frequencyUom);

		setInterval(() => {
			const payload = this._run(envModel);
			this.mqttClient.publish(pubTopics[0], JSON.stringify(payload), (err, _) => {
				if (err) {
					logger.error({ err }, "Error during the publishing of sensor value");
					return;
				}
				logger.debug({ payload }, "Published sensor value");
				const result = this.database.insertReading(
					this.config.id,
					this.config.type,
					{ value: payload.value, uom: payload.uom, created_by: this.constructor.name }
				)
			});
		}, frequencyConverted);

		logger.info("Sensor started");
	}

	public stop(logger: Logger): void {
		const { subTopics } = this.config;
		this.mqttClient.unsubscribe(subTopics, (err: any, _: any) => {
			if (err) {
				logger.error({ err }, `Couldn't unsubscribe from the topic ${subTopics}`)
				return;
			}

			logger.debug(`Successfully unsubscribed to the topic ${subTopics}`);
			logger.info("Sensor stopped")
		});
	}

	// private methods -----------------------------------------------------------------------------
	/**
	 * @brief Function for the creation of component values
	 * @return Record<string, any>
	 */
	private _run(envModel: IModel): { value: number, uom: string } {
		return {
			uom: this.config.uom,
			value: envModel.getValue()
		}
	}
}
