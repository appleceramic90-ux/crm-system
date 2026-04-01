import { z } from 'zod'

// 统计概览
export const StatsOverviewSchema = z.object({
  totalCustomers: z.number(),
  newThisMonth: z.number(),
  activeCustomers: z.number(),
  dealCustomers: z.number(),
})

// 来源统计项
export const SourceStatSchema = z.object({
  source: z.string(),
  count: z.number(),
})

// 状态统计项
export const StatusStatSchema = z.object({
  status: z.string(),
  count: z.number(),
})

// 趋势统计项
export const TrendStatSchema = z.object({
  month: z.string(),
  count: z.number(),
})

export type StatsOverview = z.infer<typeof StatsOverviewSchema>
export type SourceStat = z.infer<typeof SourceStatSchema>
export type StatusStat = z.infer<typeof StatusStatSchema>
export type TrendStat = z.infer<typeof TrendStatSchema>
