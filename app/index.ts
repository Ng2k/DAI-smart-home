/**
 * @brief Application entrypoint
 * @file index.ts
 * @author Nicola Guerra
 */
import { eq } from "drizzle-orm";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";

import { logger } from "@/libs/logger";
import { Mqtt } from "@/libs/mqtt";
import { components, users, rooms } from "@/db/schema";
import { RoomAgent, Orchestrator } from "@/agents";
import { Sensor, Actuator } from "@/components";
import type { SensorConfig, ComponentConfig } from "@/components";
import "@/metrics";
import { startMetricsServer } from "@/metrics/server";

const getAllRooms = async (
	db: NodePgDatabase,
	userId: string
): Promise<any[]> => {
	const dbRooms = await db
		.select()
		.from(rooms)
		.where(eq(rooms.user_id, userId));

	return Promise.all(
		dbRooms.map(async room => {
			const comps = await db
				.select()
				.from(components)
				.where(eq(components.room_id, room.id));

			return {
				...room,
				sensors: comps.filter(c => c.type === "sensor"),
				actuators: comps.filter(c => c.type === "actuator")
			};
		})
	);
};

const instantiateRooms = async (
	rooms: {
		id: string;
		name: string;
		sensors: SensorConfig[];
		actuators: ComponentConfig[];
	}[]
): Promise<RoomAgent[]> => {
	const mqtt = Mqtt.getInstance();

	return Promise.all(
		rooms.map(async room => {
			const sensors = await Promise.all(
				room.sensors.map(async sensor => {
					const client = await mqtt.createClient(sensor.id);
					return new Sensor(sensor, client);
				})
			);

			const actuators = await Promise.all(
				room.actuators.map(async actuator => {
					const client = await mqtt.createClient(actuator.id);
					return new Actuator(actuator, client);
				})
			);

			const roomClient = await mqtt.createClient(room.id);

			logger.info(
				{ room: room.id, sensors: sensors.length, actuators: actuators.length },
				"Room instantiated"
			);

			return new RoomAgent(
				room.id,
				sensors,
				actuators,
				roomClient
			);
		})
	);
};

const main = async () => {
	const dbUrl = Bun.env.DATABASE_URL;
	const userId = Bun.env.USER_ID;

	if (!dbUrl || !userId) {
		logger.error("DATABASE_URL or USER_ID missing");
		process.exit(1);
	}

	const db = drizzle({ connection: dbUrl, casing: "snake_case" });

	const user = (
		await db.select().from(users).where(eq(users.id, userId))
	)[0];

	if (!user) {
		logger.error({ userId }, "User not found");
		process.exit(1);
	}

	const roomConfigs = await getAllRooms(db, user.id);
	const roomAgents = await instantiateRooms(roomConfigs);

	const orchestratorClient = await Mqtt.getInstance().createClient("orchestrator");
	const orchestrator = new Orchestrator(user.id, orchestratorClient);

	startMetricsServer();

	logger.info({ rooms: roomAgents.length }, "System started successfully");
};

main().catch(err => {
	logger.fatal({ err }, "Fatal startup error");
	process.exit(1);
});
