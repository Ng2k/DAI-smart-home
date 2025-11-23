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
	ROOM = "room",
	REGISTRY = "registry",
	CONTROLLER = "controller",
}

/**
 * @brief Sensor type
 * @enum SensorType
 */
export enum SensorType {
	TEMPERATURE = "temperature",
	HUMIDITY = "humidity",
}

/**
 * @brief Actuator type
 * @enum ActuatorType
 */
export enum ActuatorType {
	HEATER = "heater"
}

/**
 * @brief Controller type
 * @enum ControllerType
 */
export enum ControllerType {
	TEMPERATURE = "temperature",
}

/**
 * @brief Topics
 * @enum Topics
 */
export enum Topics {
	REGISTRY_AGENTS = "home/registry/agents",
	REGISTRY_AGENTS_ACK = "home/registry/agents/ack",
	ACTUATOR_HEATER_ACK = "home/floor/1/room/living-room/actuators/heater",
	ACTUATOR_DEHUMIDIFIER_ACK = "home/floor/1/room/living-room/actuators/dehumidifier",
}

/**
 * @brief Publish frequency unit of measure
 * @enum PublishFrequencyUom
 */
export enum Uom {
	MILLISECONDS = "ms",
	SECONDS = "sec",
	MINUTES = "min",
	HOURS = "h",
	DAYS = "d",
	MONTHS = "M",
	YEARS = "y",
	DEGREES_CELSIUS = "°C",
	DEGREES_FAHRENHEIT = "°F",
	PERCENTAGE = "%",
	WATTS = "W",
	VOLTS = "V",
	AMPS = "A",
	OHMS = "Ω",
}
