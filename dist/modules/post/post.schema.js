// src/modules/post/post.schema.ts
import { z } from 'zod';
export const postSchema = {
    create: z.object({
        title: z.string().min(3).max(100),
        content: z.string().min(10).max(5000),
        tags: z.array(z.string().min(2).max(20)).optional(),
    }),
    search: z.object({
        q: z
            .string()
            .min(1, 'Поисковый запрос не может быть пустым')
            .transform(val => {
            // Полная очистка строки
            return val
                .trim() // Обрезаем пробелы по краям
                .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
                .replace(/[<>{}[\]|&;$%@"'()*,+!?\\]/g, ''); // Удаляем опасные символы
        }),
        limit: z.coerce.number().min(1).max(100).default(20),
        offset: z.coerce.number().min(0).default(0),
    }),
    like: z.object({
        postId: z.string().uuid(),
    }),
};
