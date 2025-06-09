/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Авторизация, регистрация, верификация
 *   - name: Users
 *     description: Управление пользователями
 *   - name: Posts
 *     description: Управление постами
 *   - name: Comments
 *     description: Управление комментариями
 *   - name: Avatar
 *     description: Работа с аватарками через MinIO
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: sessionId
 *
 *   schemas:
 *     # --- Базовые ответы ---
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *
 *     IdResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "clnjak7xj000008l0a9zq3k4f"
 *
 *     # --- Ошибки ---
 *     ErrorUnauthorized:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Unauthorized"
 *         error:
 *           type: string
 *           example: "Invalid token"
 *         statusCode:
 *           type: integer
 *           example: 401
 *
 *     ErrorForbidden:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Forbidden"
 *         error:
 *           type: string
 *           example: "You do not have access"
 *         statusCode:
 *           type: integer
 *           example: 403
 *
 *     ErrorValidation:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *         statusCode:
 *           type: integer
 *           example: 400
 *
 *     ErrorNotFound:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Not found"
 *         error:
 *           type: string
 *           example: "Resource not found"
 *         statusCode:
 *           type: integer
 *           example: 404
 *
 *     # --- Пагинация ---
 *     PaginationRequest:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 100
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalPages:
 *           type: integer
 *           example: 10
 *
 *     # --- Пользователь ---
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
 *           example: "https://example.com/avatar.jpg"
 *         bio:
 *           type: string
 *           example: "Люблю разрабатывать API"
 *         website:
 *           type: string
 *           format: uri
 *           example: "https://example.com"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-01T12:00:00Z"
 *
 *     UserUpdateProfileRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Иван Петров"
 *         bio:
 *           type: string
 *           maxLength: 500
 *           example: "Люблю разрабатывать API"
 *         website:
 *           type: string
 *           format: uri
 *           example: "https://example.com"
 *
 *     # --- Аутентификация ---
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Иван Иванов"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "password123"
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           example: "password123"
 *
 *     VerifyEmailResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Email успешно подтвержден"
 *
 *     ResendVerificationResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Письмо подтверждения отправлено"
 *
 *     # --- Посты ---
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "clnjak7xj000008l0a9zq3k4f"
 *         title:
 *           type: string
 *           example: "Как писать хороший API"
 *         content:
 *           type: string
 *           example: "API должен быть простым, предсказуемым и документированным..."
 *         authorId:
 *           type: string
 *           example: "clnja0001user123456789"
 *         likesCount:
 *           type: integer
 *           example: 123
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-02T14:00:00Z"
 *
 *     PostCreate:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           example: "Как писать хороший API"
 *         content:
 *           type: string
 *           minLength: 10
 *           example: "API должен быть простым, предсказуемым и документированным..."
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 10
 *           example: ["api", "swagger"]
 *
 *     PostUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *         content:
 *           type: string
 *           minLength: 10
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 10
 *
 *     # --- Комментарии ---
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "clnjak7xj000008l0a9zq3k4f"
 *         content:
 *           type: string
 *           example: "Хорошая статья!"
 *         authorId:
 *           type: string
 *           example: "clnja0001user123456789"
 *         postId:
 *           type: string
 *           example: "clp123456post987654321"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-01T12:00:00Z"
 *
 *     CommentCreate:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 2
 *           maxLength: 1000
 *           example: "Очень полезный пост!"
 *
 *     # --- Аватарки ---
 *     UploadUrlResponse:
 *       type: object
 *       properties:
 *         uploadUrl:
 *           type: string
 *           format: uri
 *           example: "https://minio.example.com/presigned-url"
 *         key:
 *           type: string
 *           example: "avatars/clnjak7xj000008l0a9zq3k4f.jpg"
 *
 *     AvatarConfirmRequest:
 *       type: object
 *       required:
 *         - key
 *       properties:
 *         key:
 *           type: string
 *           example: "avatars/clnjak7xj000008l0a9zq3k4f.jpg"
 *
 *     AvatarConfirmResponse:
 *       type: object
 *       properties:
 *         avatarUrl:
 *           type: string
 *           format: uri
 *           example: "https://minio.example.com/avatars/clnjak7xj000008l0a9zq3k4f.jpg"
 *
 *     FileUploadRequest:
 *       type: object
 *       required:
 *         - filename
 *         - contentType
 *       properties:
 *         filename:
 *           type: string
 *           example: "document.pdf"
 *         contentType:
 *           type: string
 *           example: "application/pdf"
 */
