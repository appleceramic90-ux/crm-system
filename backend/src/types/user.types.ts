import { z } from 'zod'

// 用户基础模型
export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

// 登录请求
export const LoginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(6, '密码至少6位'),
})

// 注册请求
export const RegisterSchema = z.object({
  username: z.string().min(3, '用户名至少3位').max(50),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位').max(100),
  name: z.string().max(100).optional(),
})

// JWT Token 载荷
export const TokenPayloadSchema = z.object({
  userId: z.string().uuid(),
  username: z.string(),
  iat: z.number(),
  exp: z.number(),
})

export type User = z.infer<typeof UserSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type TokenPayload = z.infer<typeof TokenPayloadSchema>
