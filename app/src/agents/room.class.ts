/**
 * @brief Room agent class file for the project
 * @file room.class.ts
 * @author Nicola Guerra
 */
import { basename } from "path"

import { Agent } from "./agent.abstract";
import { logger, type Logger, Topics, controllerTypeToClassMapping, sensorTypeToClassMapping } from "../utils";
import type { T_MqttConfig, T_RoomAgentConfig, } from "../utils";
import { Controller, Sensor } from "../components";

/**
 * @brief Room agent class
 * @class RoomAgent
 */
export class RoomAgent extends Agent {
	protected override readonly _logger: Logger = logger.child({ name: basename(__filename) });
	private _isRegistered: boolean = false;
	protected readonly _sensors: Sensor[] = [];
	protected readonly _controllers: Controller[] = [];
	protected override readonly  _topicToFunctionMap: Record<string, (message: string) => void> = {
		[Topics.REGISTRY_AGENTS_ACK]: this._handleRegistrationAck.bind(this),
	};

	constructor(agentConfig: T_RoomAgentConfig, mqttConfigs: T_MqttConfig) {
		super(agentConfig, mqttConfigs);
		this._subscribeToTopics();
		this._registerAgent();
		this._initializeSensors();
		this._initializeControllers();

		this._logger.info(`${agentConfig.name} agent initialized`);
	}

	// public methods-------------------------------------------------------------------------------

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
			if(!SensorClass) {
				this._logger.error({ type }, `Unknown sensor type: ${type}`);
				return;
			}
			const sensorInstance = new SensorClass(
				{ ...sensor, room: this.agentConfig.name },
				this.mqttConfigs
			);
			this._sensors.push(sensorInstance);
			sensorInstance.start();
		});
		this._logger.info(`Sensors initialized`);
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
			controllerInstance.start();
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
}
