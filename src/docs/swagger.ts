import { Express } from 'express'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Auth API',
			version: '1.0.0',
		},
		components: {
			securitySchemes: {
				sessionCookie: {
					type: 'apiKey',
					in: 'cookie',
					name: 'sessionId',
				},
			},
		},
	},
	apis: ['./src/modules/**/*.ts'],
}

export const setupSwagger = (app: Express) => {
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(options)))
}
