// src/types/jwt.ts

export interface AuthJwtPayload {
	sub: string // user id
	email: string
	iat: number
	exp: number
}


// Окей, тогда считаем AuthJwtPayload текущей базой. Если позже захочешь:
// добавить туда имя, роли или кастомные поля;
// разделить AccessPayload и RefreshPayload;

// — просто напомни, и мы аккуратно расширим тип.