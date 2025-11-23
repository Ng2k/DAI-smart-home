import { logger, type T_RegistryAgentConfig, type T_RoomAgentConfig } from "./utils";
import { RoomAgent, RegistryAgent } from "./agents";
import { MqttConfig, type T_MqttConfig } from "./utils";
import { registry, rooms } from "../config/agents.json";
import roomsEnv from "../config/rooms_env.json";

type T_Agents = {
	registryAgents: RegistryAgent[];
	roomAgents: RoomAgent[];
}

const instatiateAgents = (mqttConfig: T_MqttConfig): Promise<T_Agents> => {
	return new Promise((resolve) => {
		const registryAgents = registry.map((config) => {
			return new RegistryAgent(config as T_RegistryAgentConfig, mqttConfig);
		});
		const roomAgents = rooms.map((config) => {
			return new RoomAgent(
				config as T_RoomAgentConfig,
				mqttConfig,
				(roomsEnv as Record<string, any>)[config.name]
			)
		});
		resolve({ registryAgents, roomAgents });
	});
}

async function main(): Promise<void> {
	logger.info("Starting the application");
	const mqttConfig = new MqttConfig().toJSON();
	const { registryAgents, roomAgents } = await instatiateAgents(mqttConfig);
	roomAgents.forEach(room => room.start());
}

main();
