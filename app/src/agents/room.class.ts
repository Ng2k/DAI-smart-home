/**
 * @brief Room agent class file for the project
 * @file room.class.ts
 * @author Nicola Guerra
 */
import { Agent } from "./agent.abstract";
import {
	logger,
	MqttConfig,
	Topics,
	controllerTypeToClassMapping,
	sensorTypeToClassMapping,
	actuatorTypeToClassMapping,
} from "../utils";
import type { Logger, RoomAgentConfig, } from "../utils";
import { Controller, Sensor, Actuator, RoomOrchestrator } from "../components";
import {
	type HumidityModelConfig,
	type TemperatureModelConfig,
	RoomEnv,
	TemperatureModel,
	HumidityModel,
} from "../environments";

/**
 * @brief Room agent class
 * @class RoomAgent
 */
export class RoomAgent extends Agent {
	private _isRegistered: boolean = false;
	private _roomEnv: RoomEnv;

	protected readonly _orchestrator: RoomOrchestrator;
	protected readonly _sensors: Sensor[] = [];
	protected readonly _actuators: Actuator[] = [];
	protected readonly _controllers: Controller[] = [];
	protected override readonly _logger: Logger = logger.child({ name: this.constructor.name });
	protected override readonly _topicToFunctionMap: Record<string, (message: string) => void> = {
		[Topics.REGISTRY_AGENTS_ACK]: this._handleRegistrationAck.bind(this),
		[Topics.ACTUATOR_HEATER_ACK]: this._handleHeater.bind(this),
		[Topics.ACTUATOR_DEHUMIDIFIER_ACK]: this._handleDehumidifier.bind(this),
	};

	constructor(
		agentConfig: RoomAgentConfig,
		mqttConfigs: MqttConfig,
		roomEnvConfig: Record<string, any>
	) {
		super(agentConfig, mqttConfigs);

		this._roomEnv = new RoomEnv(
			new TemperatureModel(roomEnvConfig.temperature as TemperatureModelConfig),
			new HumidityModel(roomEnvConfig.humidity as HumidityModelConfig),
		);

		this._registerAgent();

		const { orchestrator } = this.agentConfig as RoomAgentConfig;
		this._orchestrator = new RoomOrchestrator(
			{ ...orchestrator, room: this.agentConfig.name },
			mqttConfigs
		);

		this._initializeSensors();
		this._initializeControllers();
		this._initializeActuators();

		this._subscribeToTopics();
		this._startEnvLoop();

		this._logger.info(`${agentConfig.name} agent initialized`);
	}

	// public methods---------------------------------------------------------------------------------
	public start(): void {
		this._orchestrator.start();
		this._sensors.forEach(sensor => sensor.start());
		this._actuators.forEach(actuator => actuator.start());
		this._controllers.forEach(controller => controller.start());
	}
	public stop(): void {
		this._orchestrator.stop();
		this._sensors.forEach(sensor => sensor.stop());
		this._actuators.forEach(actuator => actuator.stop());
		this._controllers.forEach(controller => controller.stop());
	}

	// protected methods------------------------------------------------------------------------------
	protected override _subscribeToTopics(): void {
		super._subscribeToTopics();

		this._actuators.forEach(act => {
			const { config: { topic: { publish } } } = act.toJSON();
			this._logger.debug({ publish }, "Room agent subscribed to topic");
			this._mqttClient.subscribe(publish);
		})
	}

	// private methods--------------------------------------------------------------------------------
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
		this._logger.debug(
			{ payload: JSON.parse(payload), topic: Topics.REGISTRY_AGENTS },
			'Requesting registration'
		);
	}

	/**
	 * @brief Initialize the sensors
	 * @details This method initializes the sensors
	 * @returns void
	 */
	private _initializeSensors(): void {
		const { sensors } = this.agentConfig as RoomAgentConfig;
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
		const { actuators } = this.agentConfig as RoomAgentConfig;
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
		const { controllers } = this.agentConfig as RoomAgentConfig;
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
		const { success, id } = JSON.parse(message);
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
	 * @brief Handle the heater state
	 * @param message The message to handle
	 * @returns void
	 */
	private _handleHeater(message: string): void {
		const { ack, value } = JSON.parse(message.toString());

		if (!ack) {
			this._logger.error("Some errors in the actuator");
			return;
		}

		this._roomEnv.temperatureModel.setState(value);
	}
	/**
	 * @brief Handle the dehumidifier state
	 * @param message The message to handle
	 * @returns void
	 */
	private _handleDehumidifier(message: string): void {
		const { ack, value } = JSON.parse(message.toString());

		if (!ack) {
			this._logger.error("Some errors in the actuator");
			return;
		}

		this._roomEnv.humidityModel.setState(value);
	}
	/**
	 * @brief Start the simulation for all the sensors
	 * @return void
	 */
	private _startEnvLoop(): void {
		setInterval(() => {
			this._roomEnv.update(2);
		}, 1000);
	}
}
