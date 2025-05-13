import pino from 'pino'
import pinoHttp from 'pino-http'
import { Request, Response } from 'express'

const fileTransport = pino.transport({
	target: 'pino/file',
	options: { destination: './logs/app.log' },
})

export const logger = pino({
	level: process.env.LOG_LEVEL || 'info',
	transport:
		process.env.NODE_ENV === 'development'
			? {
					target: 'pino-pretty',
					options: {
						colorize: true,
						ignore: 'pid,hostname',
						translateTime: 'HH:MM:ss',
						messageFormat: '{msg} [status={res.status}]', // Упростили формат
					},
			  }
			: {
					target: 'pino/file',
					options: {
						destination: './logs/app.log',
						mkdir: true,
					},
			  },
	formatters: {
		level: label => ({ level: label }),
	},
	serializers: {
		error: pino.stdSerializers.err,
	},
})

export const httpLogger = pinoHttp({
	logger,
	customProps: (req: Request) => ({
		userId: req.user?.id || 'anonymous',
		ip: req.ip,
	}),
	customLogLevel: (req, res) => {
		if (res.statusCode >= 500) return 'error'
		if (res.statusCode >= 400) return 'warn'
		return process.env.NODE_ENV === 'development' ? 'debug' : 'info'
	},
	serializers: {
		req: req => ({
			method: req.method,
			url: req.url,
			headers: {
				'content-type': req.headers['content-type'],
			},
			body:
				req.url.startsWith('/api/') && process.env.NODE_ENV === 'development'
					? req.body
					: undefined,
		}),
		res: res => {
			// Исправленный сериализатор ответа
			const headers =
				typeof res.getHeaders === 'function' ? res.getHeaders() : {}

			return {
				status: res.statusCode,
				headers: {
					'content-type': headers['content-type'],
					'x-ratelimit-limit': headers['x-ratelimit-limit'],
					'x-ratelimit-remaining': headers['x-ratelimit-remaining'],
				},
			}
		},
	},
	redact: {
		paths: [
			'req.headers.cookie',
			'req.headers.authorization',
			'req.body.password',
			'req.body.email',
			'res.headers["set-cookie"]',
		],
		censor: '**REDACTED**',
		remove: false,
	},
	timestamp: () => `,"time":"${new Date().toISOString()}"`,
	autoLogging: {
		ignore: req => req.url === '/healthcheck',
	},
})