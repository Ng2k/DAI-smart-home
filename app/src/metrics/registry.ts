import client from "prom-client";

export const registry = new client.Registry();

registry.setDefaultLabels({
	app: "dai-smart-home"
});

client.collectDefaultMetrics({ register: registry });
