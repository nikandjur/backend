// src/docs/swagger.ts
import type { Express } from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

// Получаем __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Blog API',
			version: '1.0.0',
			description: 'API для блога с пользователями, постами и комментариями',
		},
		servers: [
			{
				url: 'http://localhost:5000',
				description: 'Development server',
			},
			{
				url: 'https://api.blogpsy.ru',
				description: 'Production server',
			},
		],
	},
	apis: [
		path.resolve(__dirname, '../../src/docs/swagger-root.ts'),
		path.resolve(__dirname, '../../src/modules/**/*.route.ts'),
	],
}

export const setupSwagger = (app: Express) => {
	const swaggerSpec = swaggerJSDoc(options)

	// Для дебага (опционально)
	fs.writeFileSync(
		path.resolve(__dirname, '../../openapi.json'),
		JSON.stringify(swaggerSpec, null, 2)
	)

	app.get('/swagger.json', (_, res) => {
		res.setHeader('Content-Type', 'application/json')
		res.send(swaggerSpec)
	})

	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
