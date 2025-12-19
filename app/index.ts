import mqtt from "mqtt";

import { logger, MqttConfig, Database, type RoomConfig } from "@/utils";
import { RoomAgent, RegistryAgent } from "@/agents";
import { RoomEnv, TemperatureModel, HumidityModel } from "@/environments";
import type { TemperatureModelConfig, HumidityModelConfig } from "@/environments";

import roomsEnv from "./config/rooms_env.json";

async function main(): Promise<void> {
	logger.info("Starting the application");

	// configs
	const mqttConfig = new MqttConfig();
	const { url, username, password } = mqttConfig;
	const database = Database.getInstance();

	// agents
	//const registry: RegistryConfig = await database.getRegistry()
	const { registry, rooms } = await database.getAgentConfigs();
	const registryAgent = new RegistryAgent(
		registry,
		mqttConfig,
		mqtt.connect(url, { username, password }),
		Database.getInstance()
	)

	const roomAgents = rooms.map(async (config: RoomConfig) => {
		const env: Record<
			string,
			{ temperature: Record<string, number>, humidity: Record<string, number> }
		> = roomsEnv;
		const environment = env[`${config.floor}-${config.room}`];

		if (!environment) {
			logger.warn("Environment simulator for agent is not defined");
			return;
		}

		const agent = new RoomAgent(
			config,
			mqttConfig,
			mqtt.connect(url, { username, password }),
			Database.getInstance(),
			new RoomEnv(
				new TemperatureModel(environment.temperature as TemperatureModelConfig),
				new HumidityModel(environment.humidity as HumidityModelConfig),
			)
		);

		await agent.start();
		return agent;
	});
}

main();
