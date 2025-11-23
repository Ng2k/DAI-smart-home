/**
 * @brief Room agent class file for the project
 * @file room.class.ts
 * @author Nicola Guerra
 */
import { Agent } from "./agent.abstract";
import {
	logger,
	Topics,
	controllerTypeToClassMapping,
	envTypeToClassMapping,
	sensorTypeToClassMapping,
	actuatorTypeToClassMapping
} from "../utils";
import type { Logger, T_MqttConfig, T_RoomAgentConfig, } from "../utils";
import { Controller, Sensor, Actuator } from "../components";
import { type TemperatureModelConfig,
	RoomEnv, TemperatureModel } from "../environments";

/**
 * @brief Room agent class
 * @class RoomAgent
 */
export class RoomAgent extends Agent {
	private _isRegistered: boolean = false;
	private _roomEnv: RoomEnv;

	protected readonly _sensors: Sensor[] = [];
	protected readonly _actuators: Actuator[] = [];
	protected readonly _controllers: Controller[] = [];
	protected override readonly _logger: Logger = logger.child({ name: this.constructor.name });
	protected override readonly _topicToFunctionMap: Record<string, (message: string) => void> = {
		[Topics.REGISTRY_AGENTS_ACK]: this._handleRegistrationAck.bind(this),
	};

	constructor(
		agentConfig: T_RoomAgentConfig,
		mqttConfigs: T_MqttConfig,
		roomEnvConfig: Record<string, any>
	) {
		super(agentConfig, mqttConfigs);

		this._roomEnv = new RoomEnv(
			new TemperatureModel(roomEnvConfig.temperature as TemperatureModelConfig)
		);

		this._subscribeToTopics();
		this._registerAgent();
		this._initializeSensors();
		this._initializeControllers();
		this._initializeActuators();

		this._startEnvLoop();

		this._logger.info(`${agentConfig.name} agent initialized`);
	}

	// public methods-------------------------------------------------------------------------------
	public start(): void {
		this._sensors.forEach(sensor => sensor.start());
		this._actuators.forEach(actuator => actuator.start());
		this._controllers.forEach(controller => controller.start());
	}
	public stop(): void {
		this._sensors.forEach(sensor => sensor.stop());
		this._actuators.forEach(actuator => actuator.stop());
		this._controllers.forEach(controller => controller.stop());
	}

	// private methods------------------------------------------------------------------------------
	/**
	 * @brief Register the agent
	 * @details This method registers the agent with the registry
	 * @returns void
	 */
	private _registerAgent(): void {
		if (this._isRegistered) {
			this._logger.warn('Agent already registered');
			return;
		}

		const payload = JSON.stringify(this.toJSON());
		this._mqttClient.publish(Topics.REGISTRY_AGENTS, payload);
		this._logger.debug({ payload, topic: Topics.REGISTRY_AGENTS }, 'Requesting registration');
	}
	/**
	 * @brief Initialize the sensors
	 * @details This method initializes the sensors
	 * @returns void
	 */
	private _initializeSensors(): void {
		const { sensors } = this.agentConfig as T_RoomAgentConfig;
		sensors.map((sensor) => {
			const type = sensor.type
			const SensorClass = sensorTypeToClassMapping[type];
			if (!SensorClass) {
				this._logger.error({ type }, `Unknown sensor type: ${type}`);
				return;
			}
			const sensorInstance = new SensorClass(
				{ ...sensor, room: this.agentConfig.name },
				this.mqttConfigs,
				this._roomEnv
			);

			this._sensors.push(sensorInstance);
		});
		this._logger.info(`Sensors initialized`);
	}
	/**
	 * @brief Initialize the actuators
	 * @details This method initializes the actuators of the agent
	 * @returns void
	 */
	private _initializeActuators(): void {
		const { actuators } = this.agentConfig as T_RoomAgentConfig;
		actuators.map((actuator) => {
			const type = actuator.type
			const ActuatorClass = actuatorTypeToClassMapping[type];
			if (!ActuatorClass) {
				this._logger.error({ type }, `Unknown actuator type: ${type}`);
				return;
			}
			const actuatorInstance = new ActuatorClass(
				{ ...actuator, room: this.agentConfig.name },
				this.mqttConfigs
			);
			this._actuators.push(actuatorInstance);
		});
		this._logger.info(`Actuators initialized`);
	}
	/**
	 * @brief Initialize the controllers
	 * @details This method initializes the controllers
	 * @returns void
	 */
	private _initializeControllers(): void {
		const { controllers } = this.agentConfig as T_RoomAgentConfig;
		controllers.map((controller) => {
			const type = controller.type;
			const ControllerClass = controllerTypeToClassMapping[type];
			if (!ControllerClass) {
				this._logger.error({ type }, `Unknown controller type: ${type}`);
				return;
			}
			const controllerInstance = new ControllerClass(
				{ ...controller, room: this.agentConfig.name },
				this.mqttConfigs
			);
			this._controllers.push(controllerInstance);
		});
		this._logger.info(`Controllers initialized`);
	}
	/**
	 * @brief Handle the registration acknowledgment
	 * @details This method handles the registration acknowledgment
	 * @param message The message to handle
	 * @returns void
	 */
	private _handleRegistrationAck(message: string): void {
		const { success, id }: Record<string, boolean | string> = JSON.parse(message);
		if (id !== this.id) {
			this._logger.warn(
				{ message },
				'Registration acknowledgment received for a different agent. Check subscriptions'
			);
			return;
		}
		if (!success || !id) {
			this._logger.error({ message }, 'Registration failed');
			return;
		}
		this._logger.info({ message }, 'Registration acknowledged by the registry');
		this._isRegistered = true;
	}
	/**
	 * @brief Start the simulation for all the sensors
	 * @return void
	 */
	private _startEnvLoop(): void {
		setInterval(() => {
			this._roomEnv.update(1);
		}, 1000);
	}
}
