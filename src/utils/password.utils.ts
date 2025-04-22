import bcrypt from 'bcryptjs'

// Конфигурация хеширования
const HASH_CONFIG = {
	saltRounds: 12, // Оптимальное значение для баланса безопасности/производительности
	minPasswordLength: 8,
} as const

/**
 * Валидация пароля перед хешированием
 */
function validatePassword(password: string): void {
	if (password.length < HASH_CONFIG.minPasswordLength) {
		throw new Error(
			`Password must be at least ${HASH_CONFIG.minPasswordLength} characters`
		)
	}
}

/**
 * Хеширование пароля
 */
export async function hashPassword(password: string): Promise<string> {
	validatePassword(password)
	return await bcrypt.hash(password, HASH_CONFIG.saltRounds)
}

/**
 * Сравнение пароля с хешем
 */
export async function comparePassword(
	password: string,
	hashedPassword: string
): Promise<boolean> {
	if (!password || !hashedPassword) return false
	return await bcrypt.compare(password, hashedPassword)
}

// Типы для лучшей документации
export type PasswordUtils = {
	hashPassword: typeof hashPassword
	comparePassword: typeof comparePassword
}
