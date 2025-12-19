import pino, { type Logger } from 'pino';

const NODE_ENV = Bun.env.NODE_ENV || 'production';
const LOG_LEVEL = Bun.env.LOG_LEVEL || 'info';
const LOG_TARGET = Bun.env.LOG_TARGET || 'stdout';
const LOG_FILE = Bun.env.LOG_FILE || './logs/app.log';

const isDev = ['development', 'local', 'test'].includes(NODE_ENV);
const isDockerFileLog = LOG_TARGET === 'file';

const devOptions = {
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
		},
	},
};

const prodStdoutOptions = {
	timestamp: pino.stdTimeFunctions.isoTime,
	formatters: {
		bindings: () => ({ bun_version: Bun.version }),
	},
};

const prodFileOptions = {
	...prodStdoutOptions,
	transport: {
		targets: [
			{
				target: 'pino/file',
				options: {
					destination: LOG_FILE,
				},
			},
		],
	},
};

export const logger: Logger = pino({
	...(isDev
		? devOptions
		: isDockerFileLog
			? prodFileOptions
			: prodStdoutOptions),
	level: LOG_LEVEL,
	redact: {
		paths: [],
		censor: '[PINO REDACTED]',
		remove: true,
	},
});

export type { Logger };

