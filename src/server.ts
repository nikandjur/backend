import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`)
	console.log('REDIS_URL:', process.env.REDIS_URL) // Для проверки
})
