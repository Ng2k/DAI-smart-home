import pino, { transport } from 'pino';
import type { Logger } from 'pino';

const logger_options_dev = {
	transport: {
        target: 'pino-pretty',
        options: {
        	colorize: true
        }
    }
}

const logger_options_prod = {
	level: Bun.env.LOG_LEVEL || 'info',
	timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
	formatters: {
		bindings: () => {
			return { bun_version: Bun.version };
		},
	},
	transport: {
		targets: [
			{
				target: 'pino/file',
				options: {
					destination: Bun.env.LOG_FILE || './logs/app.log',
				},
			}
		]
	}
}

const dev_env = ['dev', 'local', 'test'];

const logger = pino({
    level: Bun.env.LOG_LEVEL || 'info',
    ...(dev_env.includes(Bun.env.NODE_ENV || '') ? logger_options_dev : logger_options_prod),
	redact: {
		paths: [],
		censor: '[PINO REDACTED]',
		remove: true,
	},
});

export default logger;
export type { Logger };
