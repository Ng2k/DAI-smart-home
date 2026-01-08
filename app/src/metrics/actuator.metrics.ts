import client from "prom-client";
import { registry } from "./registry";

export const actuatorState = new client.Gauge({
	name: "actuator_state",
	help: "Actuator ON/OFF state",
	labelNames: ["room_id", "actuator"],
	registers: [registry]
});

export const actuatorCommandLatencyMs = new client.Histogram({
	name: "actuator_command_latency_ms",
	help: "Latency from request to ACK",
	labelNames: ["room_id", "actuator"],
	buckets: [50, 100, 500, 1000, 2000],
	registers: [registry]
});

export const actuatorCommandsTotal = new client.Counter({
	name: "actuator_commands_total",
	help: "Total commands executed",
	labelNames: ["room_id", "actuator"],
	registers: [registry]
});


