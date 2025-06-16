import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 8

export const hashPassword = (password: string): Promise<string> => {
	if (password.length < MIN_PASSWORD_LENGTH) {
		throw new Error(
			`Password must be at least ${MIN_PASSWORD_LENGTH} characters`
		)
	}
	return bcrypt.hash(password, SALT_ROUNDS)
}

export const comparePassword = (
	password: string,
	hash: string
): Promise<boolean> => {
	return bcrypt.compare(password, hash)
}
