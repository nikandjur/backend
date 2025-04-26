import nodemailer from 'nodemailer'
import { logger } from './logger'
import { generateVerificationToken } from '../auth/email-verification'

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: process.env.SMTP_SECURE === 'true',
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
	},
})

export const sendVerificationEmail = async (userId: string, email: string) => {
	try {
		const token = generateVerificationToken(userId)
		const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`

		await transporter.sendMail({
			from: `"My App" <${process.env.EMAIL_FROM}>`,
			to: email,
			subject: 'Verify your email',
			html: `Click <a href="${verificationUrl}">here</a> to verify your email.`,
		})

		logger.info('Verification email sent', { userId, email })
	} catch (error) {
		logger.error('Failed to send verification email', { error, userId, email })
		throw new Error('EMAIL_SEND_FAILED')
	}
}
