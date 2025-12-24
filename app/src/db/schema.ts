/**
 * @brief Database schema for Drizzle ORM
 * @file schema.ts
 * @author Nicola Guerra
 */
import { jsonb, uuid, decimal, pgTable, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

const component = pgEnum('COMPONENT', ['sensor', 'actuator']);
const event = pgEnum('EVENT_TYPE', [
	'COMPONENT_CREATED',
	'SENSOR_READING',
	'ACTUATOR_ACTION',
	'ORCHESTRATOR_COMMAND'
])

/**
 * @brief Schema for the table users
 */
export const users = pgTable("users", {
	id: uuid().primaryKey(),
	email: varchar({ length: 50 }).notNull().unique(),
	created_at: timestamp(),
});

/**
 * @brief Schema for the table rooms
 */
export const rooms = pgTable("rooms", {
	id: uuid().primaryKey(),
	user_id: uuid().references(() => users.id),
	name: varchar({ length: 16 }).notNull().default(''),
});

/**
 * @brief Schema for the table components
 */
export const components = pgTable("components", {
	id: uuid().primaryKey(),
	user_id: uuid().references(() => users.id),
	room_id: uuid().references(() => rooms.id),
	type: component().notNull(),
	name: varchar({ length: 16 }).notNull().default(''),
	power: decimal({ precision: 3, scale: 2 }).notNull().default('0.0'),
	power_uom: varchar({ length: 16 }).notNull().default(''),
	metadata: jsonb().notNull().default({})
});

/**
 * @brief Schema for the table events
 */
export const events = pgTable("events", {
	id: uuid().primaryKey(),
	created_by: uuid().notNull().references(() => components.id),
	type: event().notNull(),
	payload: jsonb().notNull().default({})
});
