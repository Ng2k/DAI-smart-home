/**
 * @file component.abstract.ts
 * @author Nicola Guerra
 */
import path from "path";
import type { MqttClient } from "mqtt";

import { logger, type Logger } from "@/libs/logger.ts";

export type ComponentConfig = {
	id: string;
	user_id: string;
	room_id: string;
	type: string;
	name: string;
	power: number;
	power_uom: string;
	metadata: {};
	created_at: string;
};

export class Component {
	protected logger: Logger;
	public readonly pubTopic: string = "";
	public readonly subTopic: string = "";

	constructor(public readonly config: ComponentConfig, protected readonly mqtt: MqttClient) {
		this.logger = logger.child({
			id: config.id,
			room: config.room_id,
			user: config.user_id,
			name: path.basename(__filename),
		});
	}
}
