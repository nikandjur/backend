import { z } from 'zod';
export const fileUploadSchema = z.object({
    prefix: z.string().optional().default('uploads'),
});
export const avatarConfirmSchema = z.object({
    objectName: z
        .string()
        .min(1, 'Object name is required')
        .regex(/^avatars\/[a-z0-9-]+-\d+$/, 'Invalid avatar object name format'),
});
