/**
 * @brief Component class
 * @file component.class.ts
 * @author Nicola Guerra
 */
import crypto from "crypto";
import mqtt from "mqtt";

import logger from "../utils/logger";

import type { IComponent } from "./component.interface";
import type { ComponentType, UnitOfMeasurement } from "./enums";
import type { Logger } from "../utils/logger";

export abstract class Component implements IComponent {
	public readonly id: string = crypto.randomUUID();
	protected readonly childLogger: Logger;

	protected mqttClient?: mqtt.MqttClient;

	private _currentRetryAttempts: number = 0;
	private readonly _maxRetryAttempts: number = 3;

    constructor(
		public readonly name: string,
		public readonly type: ComponentType,
		public readonly uom: UnitOfMeasurement,
		public readonly topics: string[],
	) {
		this.childLogger = logger.child({ component: this.toJSON() });
	}

	// Methods -------------------------------------------------------------------------------------

	public toJSON(): Record<string, any> {
		return {
			id: this.id,
			name: this.name,
			type: this.type,
			uom: this.uom,
		};
	}

	public toString(): string {
		return `Component(id=${this.id}, name=${this.name}, type=${this.type}, uom=${this.uom})`;
	}
}
