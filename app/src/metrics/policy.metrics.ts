import client from "prom-client";
import { registry } from "./registry";

export const policyViolationsTotal = new client.Counter({
	name: "policy_violations_total",
	help: "Total policy violations detected",
	labelNames: ["room_id", "policy"],
	registers: [registry]
});

export const policyBlocksTotal = new client.Counter({
	name: "policy_blocks_total",
	help: "Commands blocked by policies",
	labelNames: ["room_id", "policy"],
	registers: [registry]
});
