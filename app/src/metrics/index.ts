import client from "prom-client";

const register = new client.Registry();

register.setDefaultLabels({
	app: "dai-smart-home"
});

client.collectDefaultMetrics({ register });

/* -------------------------------------------------------------------------- */
/*                                ROOM STATE                                  */
/* -------------------------------------------------------------------------- */

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

export const roomCO2 = new client.Gauge({
	name: "room_co2_ppm",
	help: "Room CO2 concentration (ppm)",
	labelNames: ["room_id"],
	registers: [register]
});

export const roomLuminosity = new client.Gauge({
	name: "room_luminosity_lux",
	help: "Room luminosity (lux)",
	labelNames: ["room_id"],
	registers: [register]
});

/* -------------------------------------------------------------------------- */
/*                               CONTROL ERROR                                 */
/* -------------------------------------------------------------------------- */

export const roomTemperatureError = new client.Gauge({
	name: "room_temperature_error_celsius",
	help: "Difference between measured temperature and target",
	labelNames: ["room_id"],
	registers: [register]
});

export const roomCO2Error = new client.Gauge({
	name: "room_co2_error_ppm",
	help: "Difference between measured CO2 and target",
	labelNames: ["room_id"],
	registers: [register]
});

export const roomLuminosityError = new client.Gauge({
	name: "room_luminosity_error_lux",
	help: "Difference between measured luminosity and target",
	labelNames: ["room_id"],
	registers: [register]
});

/* -------------------------------------------------------------------------- */
/*                              COMFORT & POLICY                               */
/* -------------------------------------------------------------------------- */

export const roomComfortViolation = new client.Gauge({
	name: "room_comfort_violation",
	help: "1 if room is outside comfort bounds, 0 otherwise",
	labelNames: ["room_id"],
	registers: [register]
});

export const policyViolationsTotal = new client.Counter({
	name: "room_policy_violations_total",
	help: "Policy violations detected",
	labelNames: ["room_id"],
	registers: [register]
});

export const policyBlocksTotal = new client.Counter({
	name: "room_policy_blocks_total",
	help: "Commands blocked by policy",
	labelNames: ["room_id"],
	registers: [register]
});

/* -------------------------------------------------------------------------- */
/*                               ACTUATORS                                     */
/* -------------------------------------------------------------------------- */

export const actuatorState = new client.Gauge({
	name: "room_actuator_state",
	help: "Actuator state (1 = ON, 0 = OFF)",
	labelNames: ["room_id", "actuator"],
	registers: [register]
});

export const actuatorPower = new client.Gauge({
	name: "room_actuator_power",
	help: "Actuator power level (0..1)",
	labelNames: ["room_id", "actuator"],
	registers: [register]
});

export const roomCommandsTotal = new client.Counter({
	name: "room_commands_total",
	help: "Total actuator commands issued",
	labelNames: ["room_id"],
	registers: [register]
});

/* -------------------------------------------------------------------------- */
/*                                ENERGY                                       */
/* -------------------------------------------------------------------------- */

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
