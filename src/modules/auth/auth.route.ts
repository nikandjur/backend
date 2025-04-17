import { Router } from 'express'
import { login, logout, refresh, register } from './auth.controller'
import { authenticate } from './auth.middleware'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout) // передаём accessToken

// Пример защищённого роутера:
router.get('/me', authenticate, (req, res) => {
	res.json({ message: 'You are authenticated', user: req.user })
})

export default router


