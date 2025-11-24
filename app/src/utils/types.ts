/**
 * @brief Types for the project
 * @file types.ts
 * @author Nicola Guerra
 */

import type { AgentType, SensorType, Uom, ControllerType, ActuatorType } from "./enums";

/**
 * @brief Agent configuration type
 * @type AgentConfig
 */
export type AgentConfig = RegistryAgentConfig | RoomAgentConfig;

/**
 * @brief Registry agent configuration type
 * @type RegistryAgentConfig
 */
export type RegistryAgentConfig = {
	name: string;
	type: AgentType;
};

/**
 * @brief Room agent configuration type
 * @type RoomAgentConfig
 */
export type RoomAgentConfig = {
	name: string;
	type: AgentType;
	sensors: SensorConfig[];
	actuators: ActuatorConfig[];
	controllers: ControllerConfig[];
};

/**
 * @brief Sensor configuration type
 * @type SensorConfig
 */
export type SensorConfig = {
	room: string;
	type: SensorType;
	readUom: Uom;
	frequency: number;
	frequencyUom: Uom;
	topic: string;
};

/**
 * @brief Controller configuration type
 * @type ControllerConfig
 */
export type ControllerConfig = {
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
 * @type ActuatorConfig
 */
export type ActuatorConfig = {
	room: string;
	type: ActuatorType;
	topic: {
		publish: string,
		subscribe: string
	}
};

/**
 * @brief Component configuration type
 * @type ComponentConfig
 */
export type ComponentConfig = SensorConfig | ActuatorConfig | ControllerConfig;
