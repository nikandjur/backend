// src/core/init/roles.ts
import { prisma } from '../../db.js'

const ROLES = [
	{ name: 'USER', description: 'Basic user' },
	{ name: 'MODERATOR', description: 'Content moderator' },
	{ name: 'ADMIN', description: 'Superuser' },
]

export const initRoles = async () => {
	for (const role of ROLES) {
		await prisma.role.upsert({
			where: { name: role.name },
			update: {},
			create: role,
		})
	}
}
