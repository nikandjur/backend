// src/docs/swagger.ts
import type { Express } from 'express'
import fs from 'fs'
import { dirname, resolve } from 'path'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Main API',
			version: '1.0.0',
			description: 'API для работы с пользователями, постами и комментариями',
		},
		servers: [
			{
				url: 'http://localhost:5000',
				description: 'Локальный сервер',
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
				cookieAuth: {
					type: 'apiKey',
					in: 'cookie',
					name: 'sessionId',
				},
			},
		},
	},
	apis: ['./src/docs/swagger-root.ts', './src/modules/**/*.route.ts'],
}

export const setupSwagger = (app: Express) => {
	const swaggerSpec = swaggerJSDoc(options)

	const outputPath = resolve(__dirname, '../../openapi.json')
	fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2))
	console.log(`✅ OpenAPI документация сохранена в ${outputPath}`)


	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
