import nodemailer from 'nodemailer';
import { logger } from './logger.js';
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mailhog',
    port: Number(process.env.SMTP_PORT || 1025),
    secure: process.env.NODE_ENV === 'production',
    ...(process.env.NODE_ENV === 'production' && {
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    }),
});
export const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Подтверждение email',
            html: `
				<h2>Подтвердите ваш email</h2>
				<p>Для завершения регистрации перейдите по ссылке:</p>
				<p><a href="${verificationUrl}">${verificationUrl}</a></p>
				<p>Ссылка действительна 24 часа.</p>
				${process.env.NODE_ENV !== 'production'
                ? '<p><strong>Это тестовое письмо (development mode)</strong></p>'
                : ''}
			`,
        });
        if (process.env.NODE_ENV !== 'test') {
            logger.info({
                msg: 'Verification email sent',
                email,
                messageId: info.messageId,
            });
        }
    }
    catch (error) {
        logger.error({
            msg: 'Failed to send verification email',
            email,
            error: error instanceof Error ? error.message : String(error),
        });
        throw new Error('Failed to send verification email');
    }
};
