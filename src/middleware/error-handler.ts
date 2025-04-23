import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const statusCode = 'statusCode' in err ? (err as any).statusCode : 500
	const message = statusCode === 500 ? 'Internal Server Error' : err.message

	console.error(`[${new Date().toISOString()}] Error: ${err.message}`)

	res.status(statusCode).json({
		error: message,
		...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
	})
}
