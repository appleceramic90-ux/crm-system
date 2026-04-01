// 用户类型
export interface User {
  id: string
  username: string
  email: string
  name: string | null
  avatar: string | null
  createdAt: string
  updatedAt: string
}

// 客户来源
export type CustomerSource = 'website' | 'phone' | 'referral' | 'exhibition' | 'other'

// 客户状态
export type CustomerStatus = 'prospect' | 'interested' | 'deal' | 'lost'

// 客户类型
export interface Customer {
  id: string
  name: string
  company: string | null
  position: string | null
  email: string | null
  phone: string | null
  source: CustomerSource
  status: CustomerStatus
  notes: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

// 创建客户输入
export interface CreateCustomerInput {
  name: string
  company?: string
  position?: string
  email?: string
  phone?: string
  source?: CustomerSource
  status?: CustomerStatus
  notes?: string
}

// 更新客户输入
export type UpdateCustomerInput = Partial<CreateCustomerInput>

// 客户列表查询参数
export interface CustomerQuery {
  page?: number
  pageSize?: number
  search?: string
  status?: CustomerStatus
  source?: CustomerSource
  sortBy?: 'name' | 'company' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// 统计概览
export interface StatsOverview {
  totalCustomers: number
  newThisMonth: number
  activeCustomers: number
  dealCustomers: number
}

// 来源统计
export interface SourceStat {
  source: string
  count: number
}

// 状态统计
export interface StatusStat {
  status: string
  count: number
}

// 趋势统计
export interface TrendStat {
  month: string
  count: number
}

// 标签映射
export const SOURCE_LABELS: Record<CustomerSource, string> = {
  website: '官网',
  phone: '电话',
  referral: '转介绍',
  exhibition: '展会',
  other: '其他',
}

export const STATUS_LABELS: Record<CustomerStatus, string> = {
  prospect: '潜在客户',
  interested: '意向客户',
  deal: '成交客户',
  lost: '流失客户',
}

export const STATUS_COLORS: Record<CustomerStatus, string> = {
  prospect: 'bg-muted text-muted-foreground',
  interested: 'bg-info/10 text-info',
  deal: 'bg-success/10 text-success',
  lost: 'bg-destructive/10 text-destructive',
}
