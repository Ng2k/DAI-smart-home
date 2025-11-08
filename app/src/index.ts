import { AgentType, logger } from "./utils";
import { RoomAgent, RegistryAgent } from "./agents";
import { MqttConfig, type T_MqttConfig } from "./utils";
import { registry, rooms } from "../config/agents.json";

type T_Agents = {
	registryAgents: RegistryAgent[];
	roomAgents: RoomAgent[];
}

const instatiateAgents = (mqttConfig: T_MqttConfig): Promise<T_Agents> => {
	return new Promise((resolve) => {
		const registryAgents = registry.map(_ => {
			return new RegistryAgent(mqttConfig)
		});
		setTimeout(() => {
			const roomAgents = rooms.map(room => {
				return new RoomAgent(room.name, AgentType.ROOM, mqttConfig)
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
