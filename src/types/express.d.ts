import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'email'>
      session?: {
        id: string
        ip?: string
      }
    }
  }
}