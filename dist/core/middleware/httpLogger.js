import crypto from 'crypto';
export const httpLogger = (req, res, next) => {
    if (req.url === '/metrics') {
        return next();
    }
    const start = Date.now();
    const headerValue = req.headers['x-correlation-id'];
    const correlationId = Array.isArray(headerValue)
        ? headerValue[0]
        : headerValue || crypto.randomUUID();
    // Добавляем correlationId в объект запроса
    req.correlationId = correlationId;
    // Логируем начало запроса (по желанию)
    console.log(`[${correlationId}] → ${req.method} ${req.url}`);
    // После завершения ответа считаем длительность
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${correlationId}] ← ${res.statusCode} ${req.method} ${req.url} - ${duration}ms`);
    });
    next();
};
