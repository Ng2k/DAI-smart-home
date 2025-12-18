/**
 * @brief Room agent class file for the project
 * @file room.class.ts
 * @author Nicola Guerra
 */
import { type MqttClient } from "mqtt";

import { Agent } from "./agent.abstract.ts";
import {
	ActuatorType,
	logger, domainMapper,
	SensorType } from "../utils/index.ts";
import type {
	ActuatorDTO, SensorDTO,
	Database, Logger, MqttConfig, RoomConfig, SensorConfig, ActuatorConfig
} from "../utils/index.ts";
import type { RoomEnv } from "../environments/room_env.ts";
import {
	Actuator, Sensor, Controller, RoomOrchestrator,
	HumiditySensor, TemperatureSensor, HeaterActuator, DehumidifierActuator
} from "../components/index.ts";

/**
 * @brief Room agent class
 * @class RoomAgent
 */
export class RoomAgent extends Agent {
	protected override logger: Logger;
	protected override readonly topicToFunctionMap: Record<string, (message: string) => void> = {}

	private environment: RoomEnv;
	private sensors: Sensor[] = [];
	private actuators: Actuator[] = [];
	private controllers: Controller[] = [];
	private orchestrator: RoomOrchestrator | null = null;

	constructor(
		config: RoomConfig,
		mqttConfig: MqttConfig,
		mqttClient: MqttClient,
		dbClient: Database,
		environment: RoomEnv
	) {
		super(config, mqttConfig, mqttClient, dbClient);

		this.logger = logger.child({ name: this.constructor.name, id: this.config.id });
		this.environment = environment;

		super.startErrorListener(this.logger);
		super.startMessageListener(this.logger);
		this.subscribeToTopics();

		this.logger.info(
			{ agent: `${config.type}/${config.room}` },
			"Initializing room agent"
		);
	}

	//public methods -------------------------------------------------------------------------------
	public async start(): Promise<void> {
		const dto = await this.dbClient.getAgentComponents(this.config.id);
		const { sensors, actuators, controllers, orchestrator } = dto;

		// sensors
		this.sensors = sensors.reduce((acc: Sensor[], sensorDTO: SensorDTO) => {
			const config = domainMapper(sensorDTO) as SensorConfig;
			let sensor;
			switch (config.type) {
				case SensorType.TEMPERATURE:
					sensor = new TemperatureSensor(
						config,
						this.mqttConfig,
						this.dbClient,
						this.environment
					);
					sensor.start();
					break;
				case SensorType.HUMIDITY:
					sensor = new HumiditySensor(
						config,
						this.mqttConfig,
						this.dbClient,
						this.environment
					);
					sensor.start();
					break;
				default:
					this.logger.warn(
						{ type: config.type },
						"Sensor type is not implemented in the system"
					);
			}
			return acc;
		}, []);

		// actuators
		this.actuators = actuators.reduce((acc: Actuator[], actuatorsDTO: ActuatorDTO) => {
			const config = domainMapper(actuatorsDTO) as ActuatorConfig;
			let actuator;
			switch (config.type) {
				case ActuatorType.HEATER:
					actuator = new HeaterActuator(
						config,
						this.mqttConfig,
						this.dbClient
					);
					actuator.start();
					break;
				case ActuatorType.DEHUMIDIFIER:
					actuator = new DehumidifierActuator(
						config,
						this.mqttConfig,
						this.dbClient,
					);
					actuator.start();
					break;
				default:
					this.logger.warn(
						{ type: config.type },
						"Actuator type is not implemented in the system"
					);
			}
			return acc;
		}, []);
		// controllers
		// orchestrator

		//Update the env simulation
		setInterval(() => {
			this.environment.update(1);
		}, 500);
	}

	// protected methods ---------------------------------------------------------------------------
	protected override subscribeToTopics(): void {
		super.subscribeToTopics(this.logger);
	}
}
