// src/docs/swagger.ts
import type { Express } from 'express'
import fs from 'fs'
import path from 'path'
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
console.log(basePath)
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
				url: isProduction ? 'https://api.blogpsy.ru' : 'http://localhost:5000',
				description: 'сервер',
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
		security: [{ bearerAuth: [] }],
	},

	// Пути зависят от окружения

	apis: isProduction
		? [`${basePath}/docs/swagger-root.js`, `${basePath}/modules/**/*.route.js`]
		: [`${basePath}/docs/swagger-root.ts`, `${basePath}/modules/**/*.route.ts`],
}

export const setupSwagger = (app: Express) => {
	// 1. Генерируем спецификацию
	const swaggerSpec = swaggerJSDoc(options)

	// 2. Сохраняем в файл (опционально, для дебага)
	const outputPath = path.resolve(__dirname, '../../openapi.json')
	fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2))

	// 3. Отдаем спецификацию по URL
	app.get('/swagger.json', (req, res) => {
		res.setHeader('Content-Type', 'application/json')
		res.send(swaggerSpec)
	})

	// 4. Настраиваем Swagger UI (передаем спецификацию напрямую)
	app.use(
		'/api-docs',
		swaggerUi.serve,
		swaggerUi.setup(swaggerSpec) // ← Просто передаем объект, без лишних опций
	)
}
