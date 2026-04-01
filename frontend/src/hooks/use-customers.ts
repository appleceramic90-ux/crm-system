import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, getErrorMessage } from '@/lib/api-client'
import {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerQuery,
  PaginatedResponse,
} from '@/types'
import { toast } from 'sonner'

// 获取客户列表
export function useCustomers(query: CustomerQuery = {}) {
  return useQuery({
    queryKey: ['customers', query],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (query.page) params.append('page', String(query.page))
      if (query.pageSize) params.append('pageSize', String(query.pageSize))
      if (query.search) params.append('search', query.search)
      if (query.status) params.append('status', query.status)
      if (query.source) params.append('source', query.source)
      if (query.sortBy) params.append('sortBy', query.sortBy)
      if (query.sortOrder) params.append('sortOrder', query.sortOrder)

      const response = await apiClient.get<PaginatedResponse<Customer>>(`/customers?${params}`)
      return response.data
    },
  })
}

// 获取单个客户
export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await apiClient.get<{ customer: Customer }>(`/customers/${id}`)
      return response.data.customer
    },
    enabled: !!id,
  })
}

// 创建客户
export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCustomerInput) => {
      const response = await apiClient.post<{ customer: Customer }>('/customers', data)
      return response.data.customer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('客户创建成功')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || '创建失败')
    },
  })
}

// 更新客户
export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerInput }) => {
      const response = await apiClient.put<{ customer: Customer }>(`/customers/${id}`, data)
      return response.data.customer
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] })
      toast.success('客户更新成功')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || '更新失败')
    },
  })
}

// 删除客户
export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/customers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('客户删除成功')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || '删除失败')
    },
  })
}

// 批量删除客户
export function useBatchDeleteCustomers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiClient.post<{ success: boolean; count: number }>('/customers/batch-delete', { ids })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('批量删除成功')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || '批量删除失败')
    },
  })
}
