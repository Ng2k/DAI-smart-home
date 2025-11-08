/**
 * @brief Mappings for the project
 * @file mappings.ts
 * @author Nicola Guerra
 */

import { Controller, TemperatureController } from "../components";
import { ControllerType } from "./enums";

/**
 * @brief Controller type to class mapping
 * @type T_ControllerTypeToClassMapping
 */
export const controllerTypeToClassMapping: Record<string, new (...args: any[]) => Controller> = {
	[ControllerType.TEMPERATURE]: TemperatureController,
};
