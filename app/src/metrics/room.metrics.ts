import client from "prom-client";
import { registry } from "./registry";

export const roomState = new client.Gauge({
	name: "room_state",
	help: "Aggregated room state",
	labelNames: ["room_id", "dimension"],
	registers: [registry]
});

export const comfortViolation = new client.Gauge({
	name: "room_comfort_violation",
	help: "1 if comfort constraints violated",
	labelNames: ["room_id"],
	registers: [registry]
});
