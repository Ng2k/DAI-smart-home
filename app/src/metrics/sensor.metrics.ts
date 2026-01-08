import client from "prom-client";
import { registry } from "./registry";

export const sensorReadings = new client.Gauge({
	name: "sensor_reading",
	help: "Raw sensor readings",
	labelNames: ["room_id", "sensor_type"],
	registers: [registry]
});

export const sensorUpdateLatencyMs = new client.Histogram({
	name: "sensor_update_latency_ms",
	help: "Latency between sensor measurements",
	labelNames: ["room_id", "sensor_type"],
	buckets: [10, 50, 100, 500, 1000],
	registers: [registry]
});
