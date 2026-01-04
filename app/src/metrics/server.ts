import http from "http";
import { register } from "./index.ts";
import { logger } from "@/libs/logger.ts";

export const startMetricsServer = (port = 9464) => {
	const server = http.createServer(async (_req, res) => {
		res.setHeader("Content-Type", register.contentType);
		res.end(await register.metrics());
	});

	server.listen(port, () => {
		logger.info(`Metrics server running on :${port}/metrics`);
	});
}
