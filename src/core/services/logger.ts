// src/core/services/logger.ts
import pino from 'pino'
import pinoHttp from 'pino-http'
import { Request, Response } from 'express'

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport:
        process.env.NODE_ENV === 'development'
            ? {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'HH:MM:ss',
                        ignore: 'pid,hostname,time',
                    },
              }
            : pino.transport({
                    target: 'pino/file',
                    options: { destination: './logs/app.log' },
              }),
    formatters: {
        level: label => ({ level: label.toUpperCase() }),
    },
    serializers: {
        req: req => ({
            method: req.method,
            url: req.url,
            route: req.route?.path,
            ip: req.ip,
            userId: req.user?.id || 'anonymous',
        }),
        res: res => ({
            statusCode: res.statusCode,
        }),
        error: err => ({
            message: err.message,
            name: err.name,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            code: (err as any).code,
            statusCode: (err as any).statusCode,
        }),
    },
})

export const httpLogger = pinoHttp<Request, Response>({
	logger,
	autoLogging: false,
	customProps: (req: Request) => ({
		method: req.method,
		url: req.url,
		route: req.route?.path, // ✅ Теперь работает
		ip: req.ip,
		userId: req.user?.id || 'anonymous',
	}),
})
