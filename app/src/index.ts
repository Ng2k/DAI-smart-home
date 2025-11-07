import logger from "./utils/logger";
import { RegistryAgent, RoomAgent, type MQTTConfig } from "./agents";

async function main() {
	if (!Bun.env.MQTT_BROKER_URL) {
		const error = new Error('MQTT_BROKER_URL is not set');
		logger.error({ error }, error.message);
		return;
	}

	const mqttConfigs: MQTTConfig = {
		brokerUrl: Bun.env.MQTT_BROKER_URL || '',
		username: Bun.env.MQTT_USERNAME || '',
		password: Bun.env.MQTT_PASSWORD || '',
	};

	const registry = new RegistryAgent("registry", mqttConfigs);
	const livingRoom = new RoomAgent("living-room", mqttConfigs);

	await registry.initialize();
	await livingRoom.initialize();
}

main();
