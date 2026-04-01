import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

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

// 获取统计概览
router.get('/overview', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).userId

  // 客户总数
  const totalCustomers = await prisma.customer.count({
    where: { userId },
  })

  // 本月新增
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const newThisMonth = await prisma.customer.count({
    where: {
      userId,
      createdAt: { gte: firstDayOfMonth },
    },
  })

  // 活跃客户（意向+成交）
  const activeCustomers = await prisma.customer.count({
    where: {
      userId,
      status: { in: ['interested', 'deal'] },
    },
  })

  // 成交客户
  const dealCustomers = await prisma.customer.count({
    where: {
      userId,
      status: 'deal',
    },
  })

  res.json({
    totalCustomers,
    newThisMonth,
    activeCustomers,
    dealCustomers,
  })
})

// 按来源统计
router.get('/by-source', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).userId

  const stats = await prisma.customer.groupBy({
    by: ['source'],
    where: { userId },
    _count: { id: true },
  })

  const sourceLabels: Record<string, string> = {
    website: '官网',
    phone: '电话',
    referral: '转介绍',
    exhibition: '展会',
    other: '其他',
  }

  const result = stats.map((item) => ({
    source: sourceLabels[item.source] || item.source,
    count: item._count.id,
  }))

  res.json(result)
})

// 按状态统计
router.get('/by-status', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).userId

  const stats = await prisma.customer.groupBy({
    by: ['status'],
    where: { userId },
    _count: { id: true },
  })

  const statusLabels: Record<string, string> = {
    prospect: '潜在客户',
    interested: '意向客户',
    deal: '成交客户',
    lost: '流失客户',
  }

  const result = stats.map((item) => ({
    status: statusLabels[item.status] || item.status,
    count: item._count.id,
  }))

  res.json(result)
})

// 趋势统计（最近6个月）
router.get('/trend', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).userId
  const months = parseInt((req.query.months as string) || '6')

  const now = new Date()
  const result = []

  for (let i = months - 1; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

    const count = await prisma.customer.count({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    result.push({
      month: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
      count,
    })
  }

  res.json(result)
})

export { router as statsRouter }
