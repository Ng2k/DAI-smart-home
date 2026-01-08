import http from "http";
import path from "path";

import { registry } from "@/metrics/registry.ts";
import { logger } from "@/libs/logger.ts";

export const startMetricsServer = (port = 9464) => {
	const log = logger.child({ name: path.basename(__filename) });

	const server = http.createServer(async (_req, res) => {
		res.setHeader("Content-Type", registry.contentType);
		res.end(await registry.metrics());
	});

	server.listen(port, () => {
		log.info(`Metrics server running on localhost:${port}`);
	});
}
