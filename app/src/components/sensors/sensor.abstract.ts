/**
 * @file sensor.abstract.ts
 * @brief Abstract class for sensors
 * @author Nicola Guerra
 */
import { MqttConfig, Database, type SensorConfig } from "../../utils";
import { Component } from "../component.abstract";
import { RoomEnv } from "../../environments";

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
	public start(): void {
		const { frequency, frequencyUom, pubTopics } = this.config;
		const frequencyConverted = this.timeUom.convert(frequency, frequencyUom);

		setInterval(() => {
			const payload = this.run();
			this.mqttClient.publish(pubTopics[0], JSON.stringify(payload), (err, _) => {
				if (err) {
					this.logger.error({ err }, "Error during the publishing of sensor value");
					return;
				}
				this.logger.debug({ payload }, "Published sensor value");
				const result = this.database.insertReading(
					this.config.id,
					this.config.type,
					{ value: payload.value, uom: payload.uom, created_by: this.constructor.name }
				)
			});
		}, frequencyConverted);

		this.logger.info("Sensor started");
	}

	public stop(): void {
		const { subTopics } = this.config;
		this.mqttClient.unsubscribe(subTopics, (err: any, _: any) => {
			if (err) {
				this.logger.error({ err }, `Couldn't unsubscribe from the topic ${subTopics}`)
				return;
			}

			this.logger.debug(`Successfully unsubscribed to the topic ${subTopics}`);
			this.logger.info("Sensor stopped")
		});
	}

	// protected methods -----------------------------------------------------------------------------
	/**
	 * @brief Function for the creation of component values
	 * @return Record<string, any>
	 */
	protected abstract run(): { value: number, uom: string };
}
