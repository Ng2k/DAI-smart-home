import client from "prom-client";
import { registry } from "./registry";

export const controlError = new client.Gauge({
	name: "control_error",
	help: "Difference between target and measured value",
	labelNames: ["room_id", "dimension"],
	registers: [registry]
});

export const controlConvergenceTimeMs = new client.Histogram({
	name: "control_convergence_time_ms",
	help: "Time to reach target comfort",
	labelNames: ["room_id", "dimension"],
	buckets: [100, 500, 1000, 5000, 10000],
	registers: [registry]
});
