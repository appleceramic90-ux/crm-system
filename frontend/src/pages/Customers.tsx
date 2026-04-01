import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, Filter, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCustomers, useDeleteCustomer, useBatchDeleteCustomers } from '@/hooks/use-customers'
import { Customer, STATUS_LABELS, STATUS_COLORS, SOURCE_LABELS } from '@/types'
import { FadeIn, Stagger } from '@/components/MotionPrimitives'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 每页选项
const PAGE_SIZE_OPTIONS = [10, 20, 50]

export default function CustomersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  // 从 URL 获取查询参数
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const source = searchParams.get('source') || ''

  // 状态
  const [searchInput, setSearchInput] = useState(search)
  const [statusFilter, setStatusFilter] = useState(status)
  const [sourceFilter, setSourceFilter] = useState(source)

  // 查询数据
  const { data, isLoading } = useCustomers({
    page,
    pageSize,
    search,
    status: status as any || undefined,
    source: source as any || undefined,
  })

  const deleteCustomer = useDeleteCustomer()
  const batchDelete = useBatchDeleteCustomers()

  // 更新查询参数
  const updateParams = (updates: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) {
        newParams.delete(key)
      } else {
        newParams.set(key, String(value))
      }
    })
    setSearchParams(newParams)
  }

  // 搜索
  const handleSearch = () => {
    updateParams({ search: searchInput, page: 1 })
  }

  // 筛选
  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    updateParams({ status: value || undefined, page: 1 })
  }

  const handleSourceChange = (value: string) => {
    setSourceFilter(value)
    updateParams({ source: value || undefined, page: 1 })
  }

  // 删除客户
  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteCustomer.mutate(customerToDelete.id)
      setDeleteDialogOpen(false)
      setCustomerToDelete(null)
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedIds.length > 0) {
      batchDelete.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
        },
      })
    }
  }

  // 全选/取消全选
  const handleSelectAll = () => {
    if (data?.data) {
      if (selectedIds.length === data.data.length) {
        setSelectedIds([])
      } else {
        setSelectedIds(data.data.map((c) => c.id))
      }
    }
  }

  // 单选
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // 分页
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage })
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd', { locale: zhCN })
    } catch {
      return '-'
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">客户管理</h1>
          <p className="text-muted-foreground mt-1">管理您的所有客户信息</p>
        </div>
        <Button asChild>
          <Link to="/customers/new">
            <Plus className="h-4 w-4 mr-2" />
            新增客户
          </Link>
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索姓名、公司、邮箱、电话..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch}>搜索</Button>
            </div>

            {/* 筛选器 */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="客户状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={handleSourceChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="客户来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部来源</SelectItem>
                  {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 客户列表 */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {/* 批量操作栏 */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
              <span className="text-sm">
                已选择 {selectedIds.length} 项
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                批量删除
              </Button>
            </div>
          )}

          {/* 桌面端表格 */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={data?.data && selectedIds.length === data.data.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>客户姓名</TableHead>
                  <TableHead>公司</TableHead>
                  <TableHead>联系方式</TableHead>
                  <TableHead>来源</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-12">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.data && data.data.length > 0 ? (
                  <Stagger stagger={0.05} className="contents">
                    {data.data.map((customer) => (
                      <FadeIn
                        key={customer.id}
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                        className="contents"
                      >
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(customer.id)}
                              onChange={() => handleSelect(customer.id)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.company || '-'}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              {customer.email && (
                                <span className="text-sm">{customer.email}</span>
                              )}
                              {customer.phone && (
                                <span className="text-sm text-muted-foreground">{customer.phone}</span>
                              )}
                              {!customer.email && !customer.phone && '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {SOURCE_LABELS[customer.source]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[customer.status]}>
                              {STATUS_LABELS[customer.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(customer.createdAt)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(customer)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      </FadeIn>
                    ))}
                  </Stagger>
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      {search || status || source ? '没有找到匹配的客户' : '暂无客户数据'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 移动端卡片列表 */}
          <div className="lg:hidden divide-y">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-20 w-full" />
                </div>
              ))
            ) : data?.data && data.data.length > 0 ? (
              <Stagger stagger={0.05}>
                {data.data.map((customer) => (
                  <FadeIn
                    key={customer.id}
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    className="p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/customers/${customer.id}/edit`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{customer.name}</span>
                          <Badge className={STATUS_COLORS[customer.status]}>
                            {STATUS_LABELS[customer.status]}
                          </Badge>
                        </div>
                        {customer.company && (
                          <p className="text-sm text-muted-foreground mt-1">{customer.company}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {customer.phone && <span>{customer.phone}</span>}
                          <Badge variant="outline" className="text-xs">
                            {SOURCE_LABELS[customer.source]}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(customer)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </FadeIn>
                ))}
              </Stagger>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {search || status || source ? '没有找到匹配的客户' : '暂无客户数据'}
              </div>
            )}
          </div>

          {/* 分页 */}
          {data && data.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>共 {data.total} 条</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => updateParams({ pageSize: Number(value), page: 1 })}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} 条/页
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  上一页
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除客户「{customerToDelete?.name}」吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
