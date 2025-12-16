import {
	MqttConfig, Database,
	type RegistryAgentConfig, type RoomAgentConfig
} from "./utils";
import { RoomAgent, RegistryAgent } from "./agents";
import { registry, rooms } from "../config/agents.json";
import roomsEnv from "../config/rooms_env.json";

type T_Agents = {
	registryAgents: RegistryAgent[];
	roomAgents: RoomAgent[];
}

const instatiateAgents = (mqttConfig: MqttConfig): Promise<T_Agents> => {
	return new Promise((resolve) => {
		const registryAgents = registry.map((config) => {
			return new RegistryAgent(config as RegistryAgentConfig, mqttConfig);
		});
		const roomAgents = rooms.map((config) => {
			return new RoomAgent(
				config as RoomAgentConfig,
				mqttConfig,
				(roomsEnv as Record<string, any>)[config.name]
			)
		});
		resolve({ registryAgents, roomAgents });
	});
}

async function main(): Promise<void> {
	//logger.info("Starting the application");
	//const mqttConfig = new MqttConfig();
	//const { registryAgents, roomAgents } = await instatiateAgents(mqttConfig);
	//roomAgents.forEach(room => room.start());
	const database = new Database();
	database.getSensor('temperature', 'f1-living-room');
}

main();
