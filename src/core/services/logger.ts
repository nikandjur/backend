import pino from 'pino'
// import * as pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'

export const logger = pino.default({
	level: process.env.LOG_LEVEL || 'info',
	transport: isDev
		? {
				target: 'pino-pretty',
				options: {
					colorize: true,
					ignore: 'pid,hostname',
					translateTime: 'HH:MM:ss',
				},
		  }
		: undefined,
	formatters: {
		level: label => ({ level: label.toUpperCase() }),
	},
})




