import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { validate } from '../middleware/validation'
import { LoginSchema, RegisterSchema, UserSchema } from '../types/user.types'

const prisma = new PrismaClient()
const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

// 登录
router.post('/login', validate(LoginSchema), async (req: Request, res: Response) => {
  const { username, password } = req.body as z.infer<typeof LoginSchema>

  // 查找用户（支持用户名或邮箱登录）
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email: username },
      ],
    },
  })

  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  // 验证密码
  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  // 生成 JWT Token
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  // 返回用户信息（不含密码）
  const { password: _, ...userWithoutPassword } = user
  res.json({
    token,
    user: UserSchema.parse(userWithoutPassword),
  })
})

// 注册
router.post('/register', validate(RegisterSchema), async (req: Request, res: Response) => {
  const { username, email, password, name } = req.body as z.infer<typeof RegisterSchema>

  // 检查用户名是否已存在
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ],
    },
  })

  if (existingUser) {
    return res.status(400).json({ error: '用户名或邮箱已存在' })
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10)

  // 创建用户
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      name,
    },
  })

  // 生成 JWT Token
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  // 返回用户信息（不含密码）
  const { password: _, ...userWithoutPassword } = user
  res.status(201).json({
    token,
    user: UserSchema.parse(userWithoutPassword),
  })
})

// 获取当前用户信息
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return res.status(401).json({ error: '用户不存在' })
    }

    const { password: _, ...userWithoutPassword } = user
    res.json({ user: UserSchema.parse(userWithoutPassword) })
  } catch {
    res.status(401).json({ error: 'Token无效或已过期' })
  }
})

// 登出（前端清除 token 即可，这里仅作标记）
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true })
})

export { router as authRouter }
