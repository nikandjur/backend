import { metrics } from './metrics.js';
export const metricsMiddleware = (req, res, next) => {
    // ❌ Исключаем /metrics из обработки
    if (req.url === '/metrics') {
        return next();
    }
    const start = Date.now();
    const route = req.route?.path || req.path;
    res.on('finish', () => {
        // 🚫 Не собираем метрики в development
        if (process.env.NODE_ENV !== 'development') {
            metrics.httpRequestsTotal.inc({
                method: req.method,
                route,
                status: res.statusCode,
            });
            metrics.httpRequestDuration.observe({
                method: req.method,
                route,
            }, (Date.now() - start) / 1000 // в секундах
            );
        }
    });
    next();
};
