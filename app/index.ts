/**
 * @brief Entrypoint
 * @file index.ts
 * @author Nicola Guerra
 */
import { eq } from 'drizzle-orm';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';

import { logger } from "@/libs/logger.ts";
import { Mqtt } from "@/libs/mqtt.ts";
import { components, users, rooms } from "@/db/schema.ts";
import { RoomAgent } from "@/agents";
import { Sensor, Actuator } from "@/components";
import type { ComponentConfig, SensorMetadata } from "@/components";

const getAllRooms = async (db: NodePgDatabase, userId: string): Promise<any> => {
	try {
		const results = await db.select().from(rooms).where(eq(rooms.user_id, userId));
		return await Promise.all(
			results.map(async (room) => {
				const componentsInRoom = await db
					.select()
					.from(components)
					.where(eq(components.room_id, room.id));

				return {
					...room,
					sensors: componentsInRoom.filter(c => c.type === 'sensor'),
					actuators: componentsInRoom.filter(c => c.type === 'actuator')
				};
			})
		);
	} catch (error) {
		logger.error({ error }, "Database Error");
	}
}

const instantiateRooms = async (
	rooms: {
		id: string;
		name: string;
		sensors: ComponentConfig[];
		actuators: ComponentConfig[];
	}[]
): Promise<RoomAgent[]> => {
	const mqtt = Mqtt.getInstance();

	return Promise.all(
		rooms.map(async room => {
			const sensors: Sensor[] = await Promise.all(
				room.sensors.map(async sensor => {
					const mqttClient = await mqtt.createClient(sensor.id);
					const metadata = sensor.metadata as SensorMetadata;
					return new Sensor(sensor, mqttClient, metadata.initial_value);
				})
			);

			const actuators: Actuator[] = await Promise.all(
				room.actuators.map(async actuator => {
					const mqttClient = await mqtt.createClient(actuator.id);
					return new Actuator(actuator, mqttClient);
				})
			);

			const mqttClient = await mqtt.createClient(room.id);
			return new RoomAgent(
				room.id,
				room.name,
				sensors,
				actuators,
				mqttClient
			);
		})
	);
};

const main = async () => {
	const dbUrl = Bun.env.DATABASE_URL || "";
	const userId = Bun.env.USER_ID || "";

	if (!userId.trim()) {
		logger.error("User not setted in the env file");
		return;
	}
	if (!dbUrl.trim()) {
		logger.error("No database setted in the env file");
		return;
	}

	const db = drizzle({ connection: dbUrl, casing: 'snake_case' });
	const user = (await db.selectDistinct().from(users).where(eq(users.id, userId)))[0];

	if (!user) {
		logger.error({ userId }, "No user with that id");
		return;
	}

	const rooms = await instantiateRooms(await getAllRooms(db, user.id));
};

main();
