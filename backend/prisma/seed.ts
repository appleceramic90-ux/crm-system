import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始播种数据...')

  // 创建演示用户
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const user = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@example.com',
      password: hashedPassword,
      name: '演示用户',
    },
  })

  console.log('✅ 创建用户:', user.username)

  // 创建示例客户数据
  const customers = [
    {
      name: '张三',
      company: '腾讯科技',
      position: '产品经理',
      email: 'zhangsan@tencent.com',
      phone: '13800138001',
      source: 'website' as const,
      status: 'interested' as const,
      notes: '对产品很感兴趣，有意向购买',
      userId: user.id,
    },
    {
      name: '李四',
      company: '阿里巴巴',
      position: '技术总监',
      email: 'lisi@alibaba.com',
      phone: '13800138002',
      source: 'referral' as const,
      status: 'deal' as const,
      notes: '已签约合作',
      userId: user.id,
    },
    {
      name: '王五',
      company: '字节跳动',
      position: '运营经理',
      email: 'wangwu@bytedance.com',
      phone: '13800138003',
      source: 'exhibition' as const,
      status: 'prospect' as const,
      notes: '展会上认识的潜在客户',
      userId: user.id,
    },
    {
      name: '赵六',
      company: '美团点评',
      position: '市场总监',
      email: 'zhaoliu@meituan.com',
      phone: '13800138004',
      source: 'phone' as const,
      status: 'interested' as const,
      notes: '电话联系后有意向',
      userId: user.id,
    },
    {
      name: '孙七',
      company: '京东集团',
      position: '采购经理',
      email: 'sunqi@jd.com',
      phone: '13800138005',
      source: 'other' as const,
      status: 'lost' as const,
      notes: '已选择其他供应商',
      userId: user.id,
    },
    {
      name: '周八',
      company: '网易公司',
      position: '技术架构师',
      email: 'zhouba@netease.com',
      phone: '13800138006',
      source: 'website' as const,
      status: 'prospect' as const,
      notes: '官网咨询的潜在客户',
      userId: user.id,
    },
    {
      name: '吴九',
      company: '华为技术',
      position: '项目负责人',
      email: 'wujiu@huawei.com',
      phone: '13800138007',
      source: 'referral' as const,
      status: 'deal' as const,
      notes: '老客户推荐，已成交',
      userId: user.id,
    },
    {
      name: '郑十',
      company: '小米科技',
      position: '产品总监',
      email: 'zhengshi@xiaomi.com',
      phone: '13800138008',
      source: 'exhibition' as const,
      status: 'interested' as const,
      notes: '展会上了解产品后有意向',
      userId: user.id,
    },
  ]

  for (const customer of customers) {
    await prisma.customer.create({
      data: customer,
    })
  }

  console.log('✅ 创建示例客户数据:', customers.length, '条')
  console.log('🎉 播种完成!')
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
