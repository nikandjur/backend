import pino from 'pino'
import pinoHttp from 'pino-http'
import { Request, Response } from 'express'

const isDev = process.env.NODE_ENV === 'development'

export const logger = pino({
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

export const httpLogger = pinoHttp({
	logger,
	autoLogging: !isDev, // Логируем все запросы только в prod
	customLogLevel: (_, res) =>
		res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
})


