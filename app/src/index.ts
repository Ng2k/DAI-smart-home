import {
	logger, MqttConfig, Database,
	type RegistryConfig
} from "./utils";
import { RoomAgent, RegistryAgent } from "./agents";
import roomsEnv from "../config/rooms_env.json";

type T_Agents = {
	registryAgents: RegistryAgent[];
	roomAgents: RoomAgent[];
}

async function main(): Promise<void> {
	logger.info("Starting the application");

	// configs
	const mqttConfig = new MqttConfig();
	const database = Database.getInstance();

	// agents
	const registry: RegistryConfig = await database.getRegistry()
	const registryAgent = new RegistryAgent(registry, mqttConfig)


}

main();
