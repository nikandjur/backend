import express from 'express'
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet'
import { authRouter } from 'modules/auth'

const app = express()

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.use('/api/auth', authRouter)

app.get('/', (_, res) => {
	res.send('API is up!')
})

export default app
