// src/docs/swagger.ts
import type { Express } from 'express'
import fs from 'fs'
import { dirname, resolve } from 'path'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Определяем режим: dev или prod
const isProduction = fs.existsSync(resolve(__dirname, '../../dist'))
const basePath = isProduction
	? resolve(__dirname, '../../dist')
	: resolve(__dirname, '../../src')

// Настройки OpenAPI
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
	// Пути зависят от окружения
	apis: [
		`${basePath}/docs/swagger-root${isProduction ? '.js' : '.ts'}`,
		`${basePath}/modules/**/*.route{${isProduction ? '.js' : '.ts'}}`,
	],
}

export const setupSwagger = (app: Express) => {
	const swaggerSpec = swaggerJSDoc(options)

	// Для дебага сохраняем спецификацию
	const outputPath = resolve(__dirname, '../../openapi.json')
	fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2))
	console.log(`✅ OpenAPI документация сохранена в ${outputPath}`)

	// Явно указываем Content-Type и CORS для swagger.json
	app.get('/swagger.json', (req, res) => {
		res.setHeader('Content-Type', 'application/json')
		res.setHeader('Access-Control-Allow-Origin', '*')
		res.send(swaggerSpec)
	})

	// Правильная конфигурация Swagger UI
	app.use(
		'/api-docs',
		swaggerUi.serve,
		swaggerUi.setup(swaggerSpec, {
			explorer: true,
			swaggerOptions: {
				docExpansion: 'list',
				defaultModelsExpandDepth: -1,
			},
		})
	)
}