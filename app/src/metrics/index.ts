import client from "prom-client";

const register = new client.Registry();

register.setDefaultLabels({
	app: "dai-smart-home"
});

client.collectDefaultMetrics({ register });

//   METRICS DEFINITIONS
export const roomTemperature = new client.Gauge({
	name: "room_temperature_celsius",
	help: "Room temperature",
	labelNames: ["room_id"],
	registers: [register]
});

export const roomHumidity = new client.Gauge({
	name: "room_humidity_percent",
	help: "Room humidity percentage",
	labelNames: ["room_id"],
	registers: [register]
});

export const actuatorState = new client.Gauge({
	name: "room_actuator_state",
	help: "Actuator state (1 = ON, 0 = OFF)",
	labelNames: ["room_id", "actuator"],
	registers: [register]
});

export const roomCommandsTotal = new client.Counter({
	name: "room_commands_total",
	help: "Total actuator commands issued",
	labelNames: ["room_id"],
	registers: [register]
});

export const policyBlocksTotal = new client.Counter({
	name: "room_policy_blocks_total",
	help: "Commands blocked by policy",
	labelNames: ["room_id"],
	registers: [register]
});

export const policyViolationsTotal = new client.Counter({
	name: "room_policy_violations_total",
	help: "Policy violations detected",
	labelNames: ["room_id"],
	registers: [register]
});

export const roomEnergyWatts = new client.Gauge({
	name: "room_energy_watts",
	help: "Instantaneous power consumption",
	labelNames: ["room_id"],
	registers: [register]
});

export const roomEnergyWhTotal = new client.Counter({
	name: "room_energy_wh_total",
	help: "Total energy consumed (Wh)",
	labelNames: ["room_id"],
	registers: [register]
});

export { register };

