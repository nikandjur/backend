export {};
/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Авторизация и аутентификация
 *   - name: Comments
 *     description: Управление комментариями к постам
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "clnjak7xj000008l0a9zq3k4f"
 *         title:
 *           type: string
 *           example: "Мой первый пост"
 *         content:
 *           type: string
 *           example: "Содержание моего первого поста"
 *         likes:
 *           type: integer
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-01T12:00:00Z"
 *         author:
 *           $ref: '#/components/schemas/User'
 *     PostCreate:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           example: "Мой первый пост"
 *         content:
 *           type: string
 *           minLength: 10
 *           maxLength: 5000
 *           example: "Содержание моего первого поста"
 *     PostUpdate:
 *       allOf:
 *         - $ref: '#/components/schemas/PostCreate'
 *         - type: object
 *           properties: {}
 *     CommentCreate:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           minLength: 1
 *           maxLength: 1000
 *           example: "Новый комментарий"
 *           description: Текст комментария
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "clw8qx7uh000008jt2ok0b9vz"
 *         text:
 *           type: string
 *           example: "Комментарий"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         userId:
 *           type: string
 *         postId:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "clnjak7xj000008l0a9zq3k4f"
 *         name:
 *           type: string
 *           example: "Иван Иванов"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         avatarUrl:
 *           type: string
 *           format: uri
 *           example: "https://example.com/avatar.jpg "
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-01T12:00:00Z"
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         avatarUrl:
 *           type: string
 *           format: uri
 *         bio:
 *           type: string
 *         website:
 *           type: string
 *           format: uri
 *         emailVerified:
 *           type: boolean
 *         postsCount:
 *           type: integer
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: sessionId
 */
