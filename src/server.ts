import 'dotenv/config'
import app from './app.js'
import './core/post/post.worker.js'
import './core/storage/avatar.worker.js'
import { restoreRedisData } from './restoreRedisData.js' // Добавляем импорт

const PORT = process.env.PORT || 5000

async function startServer() {
	if (
		process.env.NODE_ENV === 'production' &&
		!process.env.REDIS_SKIP_RESTORE
	) {
		try {
			console.log('🔄 Restoring Redis data from PostgreSQL...')
			await restoreRedisData()
			console.log('✅ Redis data restored successfully')
		} catch (error) {
			console.error('❌ Failed to restore Redis data:', error)
		}
	}

	app.listen(5000, '0.0.0.0', () => {
		console.log(`🚀 Server running on http://localhost:${PORT}`)
	})
}

startServer()
