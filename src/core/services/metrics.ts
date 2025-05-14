import {
	collectDefaultMetrics,
	Counter,
	Gauge,
	Histogram,
	Registry,
} from 'prom-client'

// 1. Создаем собственный реестр
const register = new Registry()

// 2. Регистрируем стандартные метрики с префиксом
collectDefaultMetrics({ register, prefix: 'node_' })

// // 3. Обновляем стандартные метрики вручную (если нужно)
// const interval = setInterval(() => {
// 	collectDefaultMetrics({ register, prefix: 'node_' })
// }, 5000)

// 4. Кастомные метрики
export const metrics = {
	httpRequestsTotal: new Counter({
		name: 'http_requests_total',
		help: 'Total HTTP requests',
		labelNames: ['method', 'route', 'status'],
		registers: [register],
	}),

	httpRequestDuration: new Histogram({
		name: 'http_request_duration_seconds',
		help: 'HTTP request duration',
		labelNames: ['method', 'route'],
		buckets: [0.1, 0.5, 1, 2, 5],
		registers: [register],
	}),

	postViews: new Counter({
		name: 'post_views_total',
		help: 'Total post views',
		labelNames: ['postId'],
		registers: [register],
	}),

	activeUsers: new Gauge({
		name: 'active_users',
		help: 'Current active users',
		registers: [register],
	}),

	registrations: new Counter({
		name: 'user_registrations_total',
		help: 'Total user registrations',
		registers: [register],
	}),
}

// 5. Экспортируем register и интервал для остановки
export { register }

