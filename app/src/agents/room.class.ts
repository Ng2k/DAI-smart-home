/**
 * @brief Room agent class file for the project
 * @file room.class.ts
 * @author Nicola Guerra
 */
import { type MqttClient } from "mqtt";

import { Agent } from "./agent.abstract.ts";
import { logger, domainMapper } from "../utils/index.ts";
import type { Database, Logger, MqttConfig, RoomConfig, SensorConfig, SensorDTO } from "../utils/index.ts";
import type { RoomEnv } from "../environments/room_env.ts";
import { Actuator, HumiditySensor, RoomOrchestrator, Sensor, Controller, TemperatureSensor } from "../components/index.ts";

/**
 * @brief Room agent class
 * @class RoomAgent
 */
export class RoomAgent extends Agent {
	protected override readonly _topicToFunctionMap: Record<string, (message: string) => void> = {}

	private _sensors: Sensor[] = [];
	private _actuators: Actuator[] = [];
	private _controllers: Controller[] = [];
	private _orchestrator: RoomOrchestrator | null = null;
	private readonly _logger: Logger = logger.child({ name: this.constructor.name });

	constructor(
		agentConfig: RoomConfig,
		mqttConfig: MqttConfig,
		mqttClient: MqttClient,
		dbClient: Database,
		private readonly _environment: RoomEnv
	) {
		super(agentConfig, mqttConfig, mqttClient, dbClient);

		this._logger.info(
			{ agent: `${agentConfig.type}/${agentConfig.room}` },
			"Initializing room agent"
		);

		super._startErrorListener(this._logger);
		super._startMessageListener(this._logger);
		this._subscribeToTopics();
	}

	//public methods -------------------------------------------------------------------------------
	public async start(): Promise<void> {
		const dto = await this._dbClient.getAgentComponents(this._agentConfig.id);
		const { sensors, actuators, controllers, orchestrator } = dto;

		// sensors
		this._sensors = sensors.reduce((acc: Sensor[], sensorDTO: SensorDTO) => {
			const config = domainMapper(sensorDTO) as SensorConfig;
			let sensor;
			switch (config.type) {
				case 'temperature':
					sensor = new TemperatureSensor(config, this._mqttConfig, this._environment);
					sensor.start();
					break;
				case 'humidity':
					sensor = new HumiditySensor(config, this._mqttConfig, this._environment);
					sensor.start();
					break;
				default:
					this._logger.warn(
						{ type: config.type },
						"Sensor type is not implemented in the system"
					);
			}
			return acc;
		}, []);

		// actuators
		// controllers
		// orchestrator

		//Update the env simulation
		setInterval(() => {
			this._environment.update(1);
		}, 500);
	}

	// protected methods ---------------------------------------------------------------------------
	protected override _subscribeToTopics(): void {
		super._subscribeToTopics(this._logger);
	}
}
