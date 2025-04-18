import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { setupSwagger } from './docs/swagger.js'
import { authRouter } from './modules/auth/index.js'



const app = express()

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.use('/api/auth', authRouter)
setupSwagger(app)

app.get('/', (_, res) => {
	res.send('API is up!')
})

export default app
