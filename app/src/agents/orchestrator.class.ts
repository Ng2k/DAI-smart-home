/**
 * @file orchestrator.class.ts
 * @author Nicola Guerra
 */
import type { MqttClient } from "mqtt";

import { logger, type Logger } from "@/libs/logger.ts";

/**
 * @classdesc Rooms orchestrator, handles policies that rooms have to follow
 * @class Orchestrator
 */
export class Orchestrator {
	private readonly logger: Logger;
	private readonly maxDevices = 4;
	private currentDevices = 0;

	constructor(
		public readonly id: string,
		private readonly mqtt: MqttClient
	) {
		this.logger = logger.child({ name: this.constructor.name, id: this.id });
		if (!id.trim()) this.logger.error({ id }, "Invalid room id");

		const topics = ["rooms/+/sensors/+", "rooms/+/actuators/+"];
		this.mqtt.subscribe(topics, (error, granted) => {
			if (error) {
				this.logger.error({ error }, "Error during subscription to topics");
				return;
			}

			this.logger.info({ granted }, "Successfully subscribed to topics");
		});

		this.mqtt.on("message", (topic, payload) => {
			const component = topic.split("/+").pop()
			if ()
		});
		//TODO: controllare i threshold
		//TODO: forzare le policy
	}
}
