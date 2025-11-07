/**
 * @brief Enums for the project
 * @file enums.ts
 * @author Nicola Guerra
 */

/**
 * @brief Agent type
 * @enum AgentType
 */
export enum AgentType {
	ROOM = "Room",
	REGISTRY = "Registry",
	CONTROLLER = "Controller",
}

/**
 * @brief Sensor type
 * @enum SensorType
 */
export enum SensorType {
	Temperature = "temperature",
}

/**
 * @brief Actuator type
 * @enum ActuatorType
 */
export enum ActuatorType {
	Heater = "heater"
}

/**
 * @brief Topics
 * @enum Topics
 */
export enum Topic {
	REGISTRY_AGENTS = "/home/registry/agents",
	REGISTRY_AGENTS_ACK = "/home/registry/agents/ack",
}
