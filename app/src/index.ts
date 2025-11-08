import { logger, type T_RegistryAgentConfig, type T_RoomAgentConfig } from "./utils";
import { RoomAgent, RegistryAgent } from "./agents";
import { MqttConfig, type T_MqttConfig } from "./utils";
import { registry, rooms } from "../config/agents.json";

type T_Agents = {
	registryAgents: RegistryAgent[];
	roomAgents: RoomAgent[];
}

const instatiateAgents = (mqttConfig: T_MqttConfig): Promise<T_Agents> => {
	return new Promise((resolve) => {
		const registryAgents = registry.map((config) => {
			return new RegistryAgent(config as T_RegistryAgentConfig, mqttConfig);
		});
		setTimeout(() => {
			const roomAgents = rooms.map((config) => {
				return new RoomAgent(config as T_RoomAgentConfig, mqttConfig)
			});
			resolve({ registryAgents, roomAgents });
		}, 2000);
	});
}

async function main(): Promise<void> {
	logger.info("Starting the application");
	const mqttConfig = new MqttConfig().toJSON();
	const { registryAgents, roomAgents } = await instatiateAgents(mqttConfig);
}

main();
