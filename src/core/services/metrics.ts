import { collectDefaultMetrics, Counter, Gauge, Histogram } from 'prom-client'

// Инициализация
collectDefaultMetrics({ prefix: 'api_' })

// Кастомные метрики
export const metrics = {
	httpRequestsTotal: new Counter({
		name: 'http_requests_total',
		help: 'Total HTTP requests',
		labelNames: ['method', 'route', 'status'],
	}),
	httpRequestDuration: new Histogram({
		name: 'http_request_duration_seconds',
		help: 'HTTP request duration',
		labelNames: ['method', 'route'],
		buckets: [0.1, 0.5, 1, 2, 5],
	}),
	postViews: new Counter({
		name: 'post_views_total',
		help: 'Total post views',
		labelNames: ['postId'],
	}),
	activeUsers: new Gauge({
		name: 'active_users',
		help: 'Current active users',
	}),
}