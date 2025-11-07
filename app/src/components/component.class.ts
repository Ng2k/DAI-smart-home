/**
 * @brief Component class
 * @file component.class.ts
 * @author Nicola Guerra
 */
import crypto from "crypto";
import mqtt from "mqtt";

import logger from "../utils/logger";

import type { IComponent } from "./component.interface";
import type { ComponentType } from "./enums";
import type { Logger } from "../utils/logger";

export abstract class Component implements IComponent {
	public readonly id: string = crypto.randomUUID();
	protected readonly childLogger: Logger;

	protected mqttClient?: mqtt.MqttClient;

    constructor(
		public readonly type: ComponentType
	) {
		this.childLogger = logger.child({ component: this.toJSON() });
	}

	// Methods -------------------------------------------------------------------------------------

	public toJSON(): Record<string, any> {
		return {
			id: this.id,
			type: this.type,
		};
	}

	public toString(): string {
		return `Component(id=${this.id}, type=${this.type})`;
	}
}
