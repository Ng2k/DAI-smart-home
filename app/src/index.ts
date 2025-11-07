import { logger, type MQTTConfig, AgentType, Topic } from "./utils";
import { RoomAgent, RegistryAgent } from "./agents";

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

	const registry = new RegistryAgent(AgentType.REGISTRY, mqttConfigs);
	setTimeout(() => {
		const room = new RoomAgent("Living Room", AgentType.ROOM, mqttConfigs);
	}, 5000);
}

main();
