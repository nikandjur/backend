import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
export const hashPassword = (password) => {
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    return bcrypt.hash(password, SALT_ROUNDS);
};
export const comparePassword = (password, hash) => {
    return bcrypt.compare(password, hash);
};
