import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { validate } from '../middleware/validation'
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CustomerQuerySchema,
  BatchDeleteSchema,
} from '../types/customer.types'

const prisma = new PrismaClient()
const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// 认证中间件
const authenticate = async (req: Request, res: Response, next: Function) => {
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

    ;(req as any).userId = user.id
    next()
  } catch {
    res.status(401).json({ error: 'Token无效或已过期' })
  }
}

// 获取客户列表
router.get('/', authenticate, async (req: Request, res: Response) => {
  const query = CustomerQuerySchema.parse(req.query)
  const userId = (req as any).userId

  const where: any = { userId }

  // 搜索条件
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { company: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  // 状态筛选
  if (query.status) {
    where.status = query.status
  }

  // 来源筛选
  if (query.source) {
    where.source = query.source
  }

  // 排序
  const orderBy: any = {}
  orderBy[query.sortBy] = query.sortOrder

  // 查询总数
  const total = await prisma.customer.count({ where })

  // 分页查询
  const customers = await prisma.customer.findMany({
    where,
    orderBy,
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
  })

  res.json({
    data: customers,
    total,
    page: query.page,
    pageSize: query.pageSize,
  })
})

// 获取单个客户
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).userId

  const customer = await prisma.customer.findFirst({
    where: { id, userId },
  })

  if (!customer) {
    return res.status(404).json({ error: '客户不存在' })
  }

  res.json({ customer })
})

// 创建客户
router.post('/', authenticate, validate(CreateCustomerSchema), async (req: Request, res: Response) => {
  const userId = (req as any).userId
  const data = req.body as z.infer<typeof CreateCustomerSchema>

  const customer = await prisma.customer.create({
    data: {
      ...data,
      userId,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      position: data.position || null,
      notes: data.notes || null,
    },
  })

  res.status(201).json({ customer })
})

// 更新客户
router.put('/:id', authenticate, validate(UpdateCustomerSchema), async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).userId
  const data = req.body as z.infer<typeof UpdateCustomerSchema>

  // 检查客户是否存在且属于当前用户
  const existing = await prisma.customer.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    return res.status(404).json({ error: '客户不存在' })
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      position: data.position || null,
      notes: data.notes || null,
    },
  })

  res.json({ customer })
})

// 删除客户
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).userId

  // 检查客户是否存在且属于当前用户
  const existing = await prisma.customer.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    return res.status(404).json({ error: '客户不存在' })
  }

  await prisma.customer.delete({
    where: { id },
  })

  res.json({ success: true })
})

// 批量删除
router.post('/batch-delete', authenticate, validate(BatchDeleteSchema), async (req: Request, res: Response) => {
  const { ids } = req.body as z.infer<typeof BatchDeleteSchema>
  const userId = (req as any).userId

  const result = await prisma.customer.deleteMany({
    where: {
      id: { in: ids },
      userId,
    },
  })

  res.json({ success: true, count: result.count })
})

export { router as customerRouter }
