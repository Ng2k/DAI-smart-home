/**
 * @brief Types for the project
 * @file types.ts
 * @author Nicola Guerra
 */

import type { AgentType, SensorType, EnergyMode, Uom, ControllerType, ActuatorType } from "./enums";

/**
 * @brief Registry configuration type
 * @type RegistryConfig
 */
export type RegistryConfig = {
	id: string;
	type: AgentType;
	pub_topics: string[];
	sub_topics: string[];
	created_at: Date;
	created_by: string;
	updated_at: Date;
	updated_by: string;
};

/**
 * @brief Room agent configuration type
 * @type RoomAgentConfig
 */
export type RoomConfig = {
	type: AgentType;
	room: string;
	floor: string;
	pub_topics: string[];
	sub_topics: string[];
	orchestrator: OrchestratorConfig;
	sensors: SensorConfig[];
	actuators: ActuatorConfig[];
	controllers: ControllerConfig[];
};

export type AgentConfig = RegistryConfig | RoomConfig;

/**
 * @brief Orchestrator configuration type
 * @type OrchestratorConfig
 */
export type OrchestratorConfig = {
	room: string;
	name: string;
	type: string;
	energyMode: EnergyMode;
	topic: {
		subscribe: string[];
		publish: string;
	};
}

/**
 * @brief Sensor configuration type
 * @type SensorConfig
 */
export type SensorConfig = {
	room?: string;
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
	room?: string;
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
	room?: string;
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

/**
 * @brief Type for the objectives
 * @type Objectives
 */
export type Objectives = {
	rooms: {
		"f1-living-room": {
			energyMode: EnergyMode,
			temperature: {
				min: number,
				max: number,
				margin: number
			},
			humidity: {
				min: number,
				max: number,
				margin: number
			}
		}
	}
};
