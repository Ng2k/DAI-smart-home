import client from "prom-client";
import { registry } from "./registry";

export const roomEnergyWatts = new client.Gauge({
	name: "room_energy_watts",
	help: "Instantaneous energy consumption",
	labelNames: ["room_id"],
	registers: [registry]
});

export const roomEnergyWhTotal = new client.Counter({
	name: "room_energy_wh_total",
	help: "Total energy consumed",
	labelNames: ["room_id"],
	registers: [registry]
});

export const systemDecisionLatencyMs = new client.Histogram({
	name: "system_decision_latency_ms",
	help: "End-to-end perception → action latency",
	labelNames: ["room_id"],
	buckets: [100, 500, 1000, 5000],
	registers: [registry]
});
