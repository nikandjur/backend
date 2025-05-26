// orval.config.js
module.exports = {
	blogApi: {
		input: {
			target: './openapi.json',
			// Важно: преобразуем спецификацию перед генерацией
			override: {
				transformer: schema => {
					// Принудительно добавляем теги к методам
					Object.entries(schema.paths).forEach(([path, methods]) => {
						Object.entries(methods).forEach(([method, operation]) => {
							if (!operation.tags) {
								// Автоматически определяем тег из пути
								operation.tags = [path.split('/')[1]] // Берём первый сегмент пути (/posts → 'posts')
							}
						})
					})
					return schema
				},
			},
		},
		output: {
			mode: 'tags-split', // Ключевая настройка!
			target: './src/api',
			schemas: './src/api/model', // Все модели в один файл
			client: 'react-query',
			hooks: true,
			// Формируем пути к файлам
			filename: ({ tag }) => {
				if (!tag) return 'common.ts'
				return `${tag.toLowerCase()}/${tag.toLowerCase()}.ts` // posts/posts.ts
			},
			// Разделяем endpoints и hooks
			indexFiles: true, // Создаёт index.ts в папках
		},
	},
}
