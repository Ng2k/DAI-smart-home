/**
 * @brief Types for the project
 * @file types.ts
 * @author Nicola Guerra
 */

import type { AgentType, SensorType, Uom, ControllerType } from "./enums";

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
	actuators: [];
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
	topics: {
		publish: string;
		subscribe: string;
	};
};
