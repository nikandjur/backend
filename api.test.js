const API_URL = 'http://localhost:5000'

const TEST_DATA = {
	email: 'test@example.com',
	password: 'test123456789',
	postId: 'cmb463zrd0001ppyc1lefg6fx',
	commentId: 'cmb4656pg0003ppyc1mvcabsf',
	userId: 'cmb2q55o20000ppbcjs7pfy54',
}

// Конфигурация тестов (можно вынести в отдельный файл)
const TEST_CONFIG = [
	{
		name: 'Авторизация',
		method: 'POST',
		path: '/api/auth/login',
		noAuth: true,
		body: { email: TEST_DATA.email, password: TEST_DATA.password },
		expectStatus: 200,
	},
	{
		name: 'Получение текущего пользователя',
		method: 'GET',
		path: '/api/auth/me',
		expectStatus: 200,
	},
	{
		name: 'Получение поста',
		method: 'GET',
		path: `/api/posts/${TEST_DATA.postId}`,
		expectStatus: 200,
	},
	{
		name: 'Получение комментариев',
		method: 'GET',
		path: `/api/posts/${TEST_DATA.postId}/comments`,
		expectStatus: 200,
	},
	{
		name: 'Поиск постов',
		method: 'GET',
		path: '/api/posts/search?q=тест',
		expectStatus: 200,
	},
	{
		name: 'Топ постов',
		method: 'GET',
		path: '/api/posts/top',
		expectStatus: 200,
	},
	{
		name: 'Профиль пользователя',
		method: 'GET',
		path: `/api/user/${TEST_DATA.userId}`,
		expectStatus: 200,
	},
]

async function runTests() {
	let sessionCookie = null
	let passedTests = 0
	let failedTests = 0

	console.log('🚀 Запуск тестов API\n')

	for (const test of TEST_CONFIG) {
		console.log(`🔹 Тест: ${test.name}`)
		console.log(`${test.method} ${test.path}`)

		try {
			// Пропускаем авторизацию для самого теста авторизации
			const headers = { 'Content-Type': 'application/json' }
			if (sessionCookie && !test.noAuth) {
				headers.Cookie = sessionCookie
			}

			const res = await fetch(`${API_URL}${test.path}`, {
				method: test.method,
				headers,
				body: test.body ? JSON.stringify(test.body) : undefined,
			})

			// Сохраняем куку после успешной авторизации
			if (test.path === '/api/auth/login' && res.status === 200) {
				sessionCookie = res.headers.get('set-cookie')
				console.log('🔐 Кука сессии сохранена')
			}

			if (res.status === test.expectStatus) {
				console.log(`✅ Успех (${res.status})`)
				passedTests++
			} else {
				throw new Error(
					`Ожидался статус ${test.expectStatus}, получен ${res.status}`
				)
			}
		} catch (err) {
			console.error(`❌ Ошибка: ${err.message}`)
			failedTests++
		}
		console.log('――――――――――――――――――――')
	}

	console.log('\n📊 Итоги:')
	console.log(`✅ Успешных: ${passedTests}`)
	console.log(`❌ Проваленных: ${failedTests}`)
	console.log(`🏁 Всего тестов: ${TEST_CONFIG.length}`)
}

runTests()
