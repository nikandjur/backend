// src/core/init/roles.ts
import { prisma } from '../../db.js'

const ROLES = [
	{ name: 'USER', description: 'Basic user' },
	{ name: 'MODERATOR', description: 'Content moderator' },
	{ name: 'ADMIN', description: 'Superuser' },
]

export const initRoles = async () => {
	try {
		const count = await prisma.role.count()
		if (count >= ROLES.length) return

		for (const role of ROLES) {
			await prisma.role.upsert({
				where: { name: role.name },
				update: {},
				create: role,
			})
		}
	} catch (err) {
		console.error('Failed to init roles:', err)
	}
}
