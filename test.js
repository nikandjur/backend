const API_URL = 'http://localhost:5000'

const TEST_DATA = {
	email: 'test@example.com',
	password: 'test123456789',
	postId: 'cmb463zrd0001ppyc1lefg6fx',
	commentId: 'cmb4656pg0003ppyc1mvcabsf',
	userId: 'cmb2q55o20000ppbcjs7pfy54', // Добавили ID пользователя
}

async function runTests() {
	let sessionCookie = null

	// 1. Авторизация
	console.log('🚀 Тест: Авторизация')
	try {
		const res = await fetch(`${API_URL}/api/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: TEST_DATA.email,
				password: TEST_DATA.password,
			}),
		})

		if (res.status === 200) {
			sessionCookie = res.headers.get('set-cookie')
			console.log('✅ Авторизация успешна')
		} else {
			throw new Error(`Ошибка авторизации: ${res.status}`)
		}
	} catch (err) {
		console.error('❌ Ошибка /login:', err.message)
		return
	}

	// 2. GET /me
	console.log('🚀 Тест: GET /api/auth/me')
	try {
		const res = await fetch(`${API_URL}/api/auth/me`, {
			headers: sessionCookie ? { Cookie: sessionCookie } : {},
		})

		if (res.status === 200) {
			console.log('✅ Получен текущий пользователь')
		} else {
			throw new Error(`Ошибка /me: ${res.status}`)
		}
	} catch (err) {
		console.error('❌ Ошибка /me:', err.message)
	}

	// 3. GET /posts/:id
	console.log(`🚀 Тест: GET /api/posts/${TEST_DATA.postId}`)
	try {
		const res = await fetch(`${API_URL}/api/posts/${TEST_DATA.postId}`, {
			headers: sessionCookie ? { Cookie: sessionCookie } : {},
		})

		if (res.status === 200) {
			console.log('✅ Пост успешно загружен')
		} else {
			throw new Error(`Ошибка получения поста: ${res.status}`)
		}
	} catch (err) {
		console.error('❌ Ошибка /posts/:id:', err.message)
	}

	// 4. GET /posts/:id/comments
	console.log(`🚀 Тест: GET /api/posts/${TEST_DATA.postId}/comments`)
	try {
		const res = await fetch(
			`${API_URL}/api/posts/${TEST_DATA.postId}/comments`,
			{
				headers: sessionCookie ? { Cookie: sessionCookie } : {},
			}
		)

		if (res.status === 200) {
			console.log('✅ Комментарии успешно загружены')
		} else {
			throw new Error(`Ошибка получения комментариев: ${res.status}`)
		}
	} catch (err) {
		console.error('❌ Ошибка /posts/:id/comments:', err.message)
	}

	// 5. GET /posts/search
	console.log(`🚀 Тест: GET /api/posts/search?q="тест"`)
	try {
		const res = await fetch(
			`${API_URL}/api/posts/search?q=%D1%82%D0%B5%D1%81%D1%82`,
			{
				headers: sessionCookie ? { Cookie: sessionCookie } : {},
			}
		)

		if (res.status === 200) {
			console.log('✅ Поиск постов работает')
		} else {
			throw new Error(`Ошибка /posts/search: ${res.status}`)
		}
	} catch (err) {
		console.error('❌ Ошибка /posts/search:', err.message)
	}

	// 6. GET /posts/top
	console.log('🚀 Тест: GET /api/posts/top')
	try {
		const res = await fetch(`${API_URL}/api/posts/top`, {
			headers: sessionCookie ? { Cookie: sessionCookie } : {},
		})

		if (res.status === 200) {
			console.log('✅ Топ постов успешно загружен')
		} else {
			throw new Error(`Ошибка /posts/top: ${res.status}`)
		}
	} catch (err) {
		console.error('❌ Ошибка /posts/top:', err.message)
	}

	// 7. GET /user/{userId}
	console.log(`🚀 Тест: GET /api/user/${TEST_DATA.userId}`)
	try {
		const res = await fetch(`${API_URL}/api/user/${TEST_DATA.userId}`, {
			headers: sessionCookie ? { Cookie: sessionCookie } : {},
		})

		if (res.status === 200) {
			console.log('✅ Профиль пользователя успешно загружен')
		} else {
			throw new Error(`Ошибка /user/:id: ${res.status}`)
		}
	} catch (err) {
		console.error('❌ Ошибка /user/:id:', err.message)
	}

	console.log('\n✅ Все тесты выполнены')
}

runTests()
