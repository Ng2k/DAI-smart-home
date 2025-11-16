/**
 * @brief Mappings for the project
 * @file mappings.ts
 * @author Nicola Guerra
 */

import { AcActuator, Actuator, Controller, Sensor, TemperatureController, TemperatureSensor } from "../components";
import { ActuatorType, ControllerType, SensorType } from "./enums";

/**
 * @brief Controller type to class mapping
 * @type T_ControllerTypeToClassMapping
 */
export const controllerTypeToClassMapping: Record<string, new (...args: any[]) => Controller> = {
	[ControllerType.TEMPERATURE]: TemperatureController,
};

/**
 * @brief Sensor type to class mapping
 * @type T_SensorTypeToClassMapping
 */
export const sensorTypeToClassMapping: Record<string, new (...args: any[]) => Sensor> = {
	[SensorType.TEMPERATURE]: TemperatureSensor,
};

/**
 * @brief Actuator type to class mapping
 * @type T_ActuatorTypeToClassMapping
 */
export const actuatorTypeToClassMapping: Record<string, new (...args: any[]) => Actuator> = {
	[ActuatorType.HEATER]: AcActuator,
};
