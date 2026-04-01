import { z } from 'zod'

// 客户来源枚举
export const CustomerSourceSchema = z.enum(['website', 'phone', 'referral', 'exhibition', 'other'])
export type CustomerSource = z.infer<typeof CustomerSourceSchema>

// 客户状态枚举
export const CustomerStatusSchema = z.enum(['prospect', 'interested', 'deal', 'lost'])
export type CustomerStatus = z.infer<typeof CustomerStatusSchema>

// 客户基础模型
export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  company: z.string().nullable(),
  position: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  source: CustomerSourceSchema,
  status: CustomerStatusSchema,
  notes: z.string().nullable(),
  userId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

// 创建客户请求
export const CreateCustomerSchema = z.object({
  name: z.string().min(1, '客户姓名不能为空').max(100),
  company: z.string().max(200).optional(),
  position: z.string().max(100).optional(),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  source: CustomerSourceSchema.optional(),
  status: CustomerStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
})

// 更新客户请求
export const UpdateCustomerSchema = CreateCustomerSchema.partial()

// 客户列表查询参数
export const CustomerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: CustomerStatusSchema.optional(),
  source: CustomerSourceSchema.optional(),
  sortBy: z.enum(['name', 'company', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// 批量删除请求
export const BatchDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, '至少选择一个客户'),
})

export type Customer = z.infer<typeof CustomerSchema>
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>
export type CustomerQuery = z.infer<typeof CustomerQuerySchema>
export type BatchDeleteInput = z.infer<typeof BatchDeleteSchema>
