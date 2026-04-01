import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCustomer, useCreateCustomer, useUpdateCustomer } from '@/hooks/use-customers'
import { SOURCE_LABELS, STATUS_LABELS, CustomerSource, CustomerStatus } from '@/types'
import { FadeIn } from '@/components/MotionPrimitives'

// 表单验证 Schema
const customerSchema = z.object({
  name: z.string().min(1, '请输入客户姓名').max(100),
  company: z.string().max(200).optional().or(z.literal('')),
  position: z.string().max(100).optional().or(z.literal('')),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  source: z.enum(['website', 'phone', 'referral', 'exhibition', 'other']).optional(),
  status: z.enum(['prospect', 'interested', 'deal', 'lost']).optional(),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

type CustomerFormData = z.infer<typeof customerSchema>

export default function CustomerFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const { data: customer, isLoading: customerLoading } = useCustomer(id || '')
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      source: 'website',
      status: 'prospect',
    },
  })

  // 编辑模式下填充数据
  useEffect(() => {
    if (customer) {
      setValue('name', customer.name)
      setValue('company', customer.company || '')
      setValue('position', customer.position || '')
      setValue('email', customer.email || '')
      setValue('phone', customer.phone || '')
      setValue('source', customer.source)
      setValue('status', customer.status)
      setValue('notes', customer.notes || '')
    }
  }, [customer, setValue])

  // 提交表单
  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (isEdit && id) {
        await updateCustomer.mutateAsync({ id, data })
        navigate('/customers')
      } else {
        await createCustomer.mutateAsync(data)
        navigate('/customers')
      }
    } catch {
      // 错误已在 hook 中处理
    }
  }

  const isLoading = customerLoading && isEdit

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      {/* 页面头部 */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? '编辑客户' : '新增客户'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? '修改客户信息' : '填写客户信息'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FadeIn>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 客户姓名 */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    客户姓名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="请输入客户姓名"
                    {...register('name')}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* 公司 */}
                <div className="space-y-2">
                  <Label htmlFor="company">公司</Label>
                  <Input
                    id="company"
                    placeholder="请输入公司名称"
                    {...register('company')}
                    disabled={isSubmitting}
                  />
                </div>

                {/* 职位 */}
                <div className="space-y-2">
                  <Label htmlFor="position">职位</Label>
                  <Input
                    id="position"
                    placeholder="请输入职位"
                    {...register('position')}
                    disabled={isSubmitting}
                  />
                </div>

                {/* 邮箱 */}
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入邮箱地址"
                    {...register('email')}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* 电话 */}
                <div className="space-y-2">
                  <Label htmlFor="phone">电话</Label>
                  <Input
                    id="phone"
                    placeholder="请输入电话号码"
                    {...register('phone')}
                    disabled={isSubmitting}
                  />
                </div>

                {/* 客户来源 */}
                <div className="space-y-2">
                  <Label htmlFor="source">客户来源</Label>
                  <Select
                    value={watch('source')}
                    onValueChange={(value) => setValue('source', value as CustomerSource)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择客户来源" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 客户状态 */}
                <div className="space-y-2">
                  <Label htmlFor="status">客户状态</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as CustomerStatus)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择客户状态" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 备注 */}
                <div className="space-y-2">
                  <Label htmlFor="notes">备注</Label>
                  <Textarea
                    id="notes"
                    placeholder="请输入备注信息"
                    rows={4}
                    {...register('notes')}
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
