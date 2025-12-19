/**
 * @file component.abstract.ts
 * @brief Abstract class for components
 * @author Nicola Guerra
 */
import mqtt, { type MqttClient } from "mqtt";

import { Database, MqttConfig, TimeUom, logger, type Logger } from "@/utils";
import type { IComponent } from "@/components/component.interface";
import type { IModel } from "@/environments";

export abstract class Component implements IComponent {
	protected readonly logger: Logger;
	protected readonly database: Database;
	protected readonly mqttClient: MqttClient;
	protected readonly timeUom: TimeUom = new TimeUom();

	constructor(mqttConfigs: MqttConfig, database: Database) {
		this.logger = logger.child({ name: this.constructor.name });
		this.database = database;
		this.mqttClient = mqtt.connect(mqttConfigs.url, {
			username: mqttConfigs.username,
			password: mqttConfigs.password
		});
	}

	public abstract start(logger: Logger, envModel: IModel): void;
	public abstract stop(logger: Logger): void;
}
