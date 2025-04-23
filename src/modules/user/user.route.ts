import { Router } from 'express'
import { authenticate } from '../auth/auth.middleware.js'
import {
	confirmAvatarUpload,
	generateAvatarUploadUrl,
} from './user.controller.js'

const router = Router()

router.post('/avatar/upload-url', authenticate, async (req, res, next) => {
	try {
		const data = await generateAvatarUploadUrl(req.user!.id)
		res.json(data)
	} catch (error) {
		next(error)
	}
})

router.post(
	'/avatar/confirm',
	authenticate,
	async (req, res, next): Promise<void> => {
		try {
			// 1. Проверяем наличие тела запроса
			if (!req.body || typeof req.body !== 'object') {
				 res.status(400).json({ error: 'Request body must be JSON' })
				 return
			}

			// 2. Проверяем обязательное поле
			const { objectName } = req.body
			if (!objectName) {
				 res.status(400).json({
					error: 'objectName is required',
					example: {
						objectName: 'avatars/cm9tvfemm0000ppqg5uaxnd2i-1745441137627',
					},
				})
				return
			}

			// 3. Проверяем формат objectName
			if (!objectName.startsWith('avatars/')) {
				 res.status(400).json({
					error: "objectName must start with 'avatars/'",
				})
				return
			}

			// 4. Если всё ок - обрабатываем
			const user = await confirmAvatarUpload(req.user!.id, objectName)
			res.json(user)
		} catch (error) {
			next(error)
		}
	}
)
export default router
