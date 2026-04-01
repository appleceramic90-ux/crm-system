import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { StatsOverview, SourceStat, StatusStat, TrendStat } from '@/types'

// 获取统计概览
export function useStatsOverview() {
  return useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: async () => {
      const response = await apiClient.get<StatsOverview>('/stats/overview')
      return response.data
    },
  })
}

// 获取来源统计
export function useStatsBySource() {
  return useQuery({
    queryKey: ['stats', 'by-source'],
    queryFn: async () => {
      const response = await apiClient.get<SourceStat[]>('/stats/by-source')
      return response.data
    },
  })
}

// 获取状态统计
export function useStatsByStatus() {
  return useQuery({
    queryKey: ['stats', 'by-status'],
    queryFn: async () => {
      const response = await apiClient.get<StatusStat[]>('/stats/by-status')
      return response.data
    },
  })
}

// 获取趋势统计
export function useStatsTrend(months: number = 6) {
  return useQuery({
    queryKey: ['stats', 'trend', months],
    queryFn: async () => {
      const response = await apiClient.get<TrendStat[]>(`/stats/trend?months=${months}`)
      return response.data
    },
  })
}
