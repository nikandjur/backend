import { PrismaClient } from '@prisma/client'

// Создаём единственный экземпляр PrismaClient для всего приложения
const prisma = new PrismaClient({
	log:
		process.env.NODE_ENV === 'development'
			? ['query', 'error', 'warn']
			: ['error'],
})

// Добавляем обработку graceful shutdown
process.on('beforeExit', async () => {
	await prisma.$disconnect()
})

export { prisma }
