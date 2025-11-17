/**
 * @brief Types for the project
 * @file types.ts
 * @author Nicola Guerra
 */

import type { AgentType, SensorType, Uom, ControllerType, ActuatorType } from "./enums";

/**
 * @brief MQTT configuration type
 * @type T_MqttConfig
 */
export type T_MqttConfig = {
	url: string;
	username: string;
	password: string;
};

/**
 * @brief Agent configuration type
 * @type T_AgentConfig
 */
export type T_AgentConfig = T_RegistryAgentConfig | T_RoomAgentConfig;

/**
 * @brief Registry agent configuration type
 * @type T_RegistryAgentConfig
 */
export type T_RegistryAgentConfig = {
	name: string;
	type: AgentType;
};

/**
 * @brief Room agent configuration type
 * @type T_RoomAgentConfig
 */
export type T_RoomAgentConfig = {
	name: string;
	type: AgentType;
	sensors: T_SensorConfig[];
	actuators: T_ActuatorConfig[];
	controllers: T_ControllerConfig[];
};

/**
 * @brief Sensor configuration type
 * @type T_SensorConfig
 */
export type T_SensorConfig = {
	room: string;
	type: SensorType;
	readUom: Uom;
	frequency: number;
	frequencyUom: Uom;
	topic: string;
};

/**
 * @brief Controller configuration type
 * @type T_ControllerConfig
 */
export type T_ControllerConfig = {
	room: string;
	type: ControllerType;
	logic: string;
	topic: {
		publish: string;
		subscribe: string;
	};
};

/**
 * @brief Actuator configuration type
 * @type T_ActuatorConfig
 */
export type T_ActuatorConfig = {
	room: string;
	type: ActuatorType;
	topic: {
		publish: string,
		subscribe: string
	}
};

/**
 * @brief Component configuration type
 * @type T_ComponentConfig
 */
export type T_ComponentConfig = T_SensorConfig | T_ActuatorConfig | T_ControllerConfig;

