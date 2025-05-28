import { logger } from '../services/logger.js';
export const handleError = (err, req, res, next) => {
    const error = err instanceof Error ? err : new Error(String(err));
    const appError = error;
    const statusCode = appError.statusCode || 500;
    const code = appError.code || `HTTP_${statusCode}`;
    const detail = appError.details;
    // Логируем только необходимое
    logger[statusCode >= 500 ? 'error' : 'warn']({
        code,
        status: statusCode,
        path: req.path,
        msg: error.message,
        ...(detail && { detail }),
        ...(statusCode >= 500 && { stack: error.stack }),
    });
    res.status(statusCode).json({
        error: error.message,
        ...(statusCode < 500 && { code }),
        ...(statusCode < 500 && detail && { detail }),
    });
};
