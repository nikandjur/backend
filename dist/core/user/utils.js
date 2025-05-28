import { prisma } from '../../db';
export const getUserProfile = async (userId) => {
    return prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            emailVerified: true,
        },
    });
};
