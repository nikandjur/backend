import { Resend } from 'resend'
import { logger } from './logger.js'
import { ERRORS } from '../utils/errors.js'

const resend = new Resend(process.env.RESEND_API_KEY!)

export const sendVerificationEmail = async (email: string, token: string) => {
	const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`
	console.log('email', email)
	try {
		const result = await resend.emails.send({
			from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
			to: [email],
			subject: 'Подтверждение email',
			html: `
				<h2>Подтвердите ваш email</h2>
				<p>Для завершения регистрации перейдите по ссылке:</p>
				<p><a href="${verificationUrl}">${verificationUrl}</a></p>
				<p>Ссылка действительна 24 часа.</p>
				${
					process.env.NODE_ENV !== 'production'
						? '<p><strong>Это тестовое письмо (development mode)</strong></p>'
						: ''
				}
			`,
		})
		console.log('result', email, result)
		if (result.error) {
			throw result.error
		}

		logger.info({
			msg: 'Resend: Email sent',
			email,
			messageId: result.data?.id ?? 'unknown',
		})
	} catch (error) {
		logger.error({
			msg: 'Ошибка при отправке письма через Resend',
			email,
			error: error instanceof Error ? error.message : String(error),
		})
		throw ERRORS.internal('Не удалось отправить письмо')
	}
}

// import nodemailer from 'nodemailer'
// import { logger } from './logger.js'

// const transporter = nodemailer.createTransport({
// 	host: process.env.SMTP_HOST || 'mailhog',
// 	port: Number(process.env.SMTP_PORT || 1025),
// 	secure: process.env.NODE_ENV === 'production',
// 	...(process.env.NODE_ENV === 'production' && {
// 		auth: {
// 			user: process.env.SMTP_USER,
// 			pass: process.env.SMTP_PASSWORD,
// 		},
// 	}),
// })

// export const sendVerificationEmail = async (email: string, token: string) => {
// 	const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`

// 	try {
// 		const info = await transporter.sendMail({
// 			from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
// 			to: email,
// 			subject: 'Подтверждение email',
// 			html: `
// 				<h2>Подтвердите ваш email</h2>
// 				<p>Для завершения регистрации перейдите по ссылке:</p>
// 				<p><a href="${verificationUrl}">${verificationUrl}</a></p>
// 				<p>Ссылка действительна 24 часа.</p>
// 				${
// 					process.env.NODE_ENV !== 'production'
// 						? '<p><strong>Это тестовое письмо (development mode)</strong></p>'
// 						: ''
// 				}
// 			`,
// 		})

// 		if (process.env.NODE_ENV !== 'test') {
// 			logger.info({
// 				msg: 'Verification email sent',
// 				email,
// 				messageId: info.messageId,
// 			})
// 		}
// 	} catch (error) {
// 		logger.error({
// 			msg: 'Failed to send verification email',
// 			email,
// 			error: error instanceof Error ? error.message : String(error),
// 		})
// 		throw new Error('Failed to send verification email')
// 	}
// }
