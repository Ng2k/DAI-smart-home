/**
 * @brief Mappings for the project
 * @file mappings.ts
 * @author Nicola Guerra
 */

import {
	Actuator, HeaterActuator, DehumidifierActuator,
	Controller, TemperatureController, HumidityController,
	Sensor, TemperatureSensor, HumiditySensor,
} from "../components";
import { ActuatorType, ControllerType, SensorType } from "./enums";
import { type IModel, TemperatureModel } from "../environments";

/**
 * @brief Controller type to class mapping
 * @type T_ControllerTypeToClassMapping
 */
export const controllerTypeToClassMapping: Record<string, new (...args: any[]) => Controller> = {
	[ControllerType.TEMPERATURE]: TemperatureController,
	[ControllerType.HUMIDITY]: HumidityController,
};

/**
 * @brief Sensor type to class mapping
 * @type T_SensorTypeToClassMapping
 */
export const sensorTypeToClassMapping: Record<string, new (...args: any[]) => Sensor> = {
	[SensorType.TEMPERATURE]: TemperatureSensor,
	[SensorType.HUMIDITY]: HumiditySensor,
};

/**
 * @brief actuator type to class mapping
 * @type t_actuatortypetoclassmapping
 */
export const actuatorTypeToClassMapping: Record<string, new (...args: any[]) => Actuator> = {
	[ActuatorType.HEATER]: HeaterActuator,
	[ActuatorType.DEHUMIDIFIER]: DehumidifierActuator,
};

/**
 * @brief env models type to class mapping
 * @type t_envtypetoclassmapping
 */

export const envTypeToClassMapping: Record<string, new (...args: any[]) => IModel> = {
	[SensorType.TEMPERATURE]: TemperatureModel
}
