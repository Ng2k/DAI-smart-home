import mqtt from "mqtt";

import { logger, MqttConfig, Database } from "./utils";
import { RoomAgent, RegistryAgent } from "./agents";
import roomsEnv from "../config/rooms_env.json";

async function main(): Promise<void> {
	logger.info("Starting the application");

	// configs
	const { url, username, password } = new MqttConfig();
	const database = Database.getInstance();

	// agents
	//const registry: RegistryConfig = await database.getRegistry()
	const { registry, rooms } = await database.getAgentConfigs();
	const registryAgent = new RegistryAgent(registry, mqtt.connect(url, { username, password }))
	const roomAgents = rooms.map(config => {
		return new RoomAgent(config, mqtt.connect(url, { username, password }));
	});
}

main();
