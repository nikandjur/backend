import { Express } from 'express'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: '3.0.0',
		servers: [{ url: '/api' }],
		info: {
			title: 'Auth API',
			version: '1.0.0',
			description: 'Документация для авторизации и аутентификации',
		},
		components: {
			securitySchemes: {
				cookieAuth: {
					type: 'apiKey',
					in: 'cookie',
					name: 'sessionId',
					description: 'Авторизация через сессионный cookie sessionId',
				},
			},
		},
		security: [{ cookieAuth: [] }],
	},
	apis: ['src/modules/**/*.ts'], // Все ts-файлы внутри modules
}

const swaggerSpec = swaggerJSDoc(options)

export function setupSwagger(app: Express) {
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
