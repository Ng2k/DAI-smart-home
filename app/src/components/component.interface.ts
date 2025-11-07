/**
 * @brief Component interface
 * @file component.interface.ts
 * @author Nicola Guerra
 */

import type { ComponentType } from "./enums";

/**
 * This interface defines the common properties for all components.
 * @interface IComponent
 */
export interface IComponent {
	readonly id: string;
	readonly type: ComponentType;

	/**
	 * @brief Convert the component to a JSON object
	 * @returns A JSON object representing the component
	 */
	toJSON(): Record<string, any>;

	/**
	 * @brief Convert the component to a string
	 * @returns A string representing the component
	 */
	toString(): string;
}
