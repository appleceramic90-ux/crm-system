# 客户管理系统 - 产品需求文档

## 产品概述

### 产品名称
客户管理系统（CRM - Customer Relationship Management）

### 产品定位
一款专业的客户关系管理系统，参考小满OKKi的设计风格，采用蓝色科技感配色，为中小企业提供简洁高效的客户管理解决方案。

### 核心价值
- **集中管理**：统一管理所有客户信息，避免信息分散
- **数据洞察**：通过数据看板了解业务状况，支持科学决策
- **高效协作**：团队成员可共享客户资源，提升协作效率
- **移动办公**：响应式设计，随时随地管理客户

---

## 核心功能

### 1. 用户认证系统

#### 1.1 登录功能
- 用户名/邮箱 + 密码登录
- 表单验证（必填项、格式校验）
- 登录状态持久化（Token 存储）
- 登录失败提示（错误信息友好展示）

#### 1.2 权限控制
- 路由守卫（未登录跳转登录页）
- API 鉴权（请求头携带 Token）
- 登出功能（清除 Token，跳转登录页）

---

### 2. 数据看板

#### 2.1 核心指标卡片
- 客户总数统计
- 本月新增客户数
- 活跃客户数
- 成交客户数

#### 2.2 数据可视化
- 客户来源分布（饼图）
- 客户趋势图表（折线图）
- 客户状态分布（柱状图）

#### 2.3 快捷操作
- 快速新增客户入口
- 待跟进客户提醒
- 近期活动动态

---

### 3. 客户列表管理

#### 3.1 列表展示
- 表格形式展示客户信息
- 显示字段：姓名、公司、联系方式、状态、来源、创建时间
- 支持列排序功能

#### 3.2 搜索与筛选
- 关键词搜索（姓名、公司、联系方式）
- 状态筛选（潜在客户、意向客户、成交客户、流失客户）
- 来源筛选（官网、电话、转介绍、展会、其他）
- 时间范围筛选

#### 3.3 分页功能
- 分页显示（每页10/20/50条）
- 总数统计
- 页码跳转

#### 3.4 批量操作
- 批量删除
- 批量修改状态
- 批量导出

---

### 4. 客户表单编辑

#### 4.1 新增客户
- 表单字段：
  - 姓名（必填）
  - 公司（选填）
  - 职位（选填）
  - 邮箱（选填，格式验证）
  - 电话（选填，格式验证）
  - 客户来源（下拉选择）
  - 客户状态（下拉选择）
  - 备注信息（多行文本）
- 表单验证提示
- 提交成功反馈

#### 4.2 编辑客户
- 复用新增表单
- 预填充现有数据
- 修改保存功能

#### 4.3 删除客户
- 删除确认弹窗
- 删除成功反馈

---

### 5. 响应式布局

#### 5.1 桌面端（≥1024px）
- 侧边栏导航
- 表格全字段展示
- 多列布局看板

#### 5.2 平板端（768px - 1023px）
- 收起侧边栏（图标模式）
- 表格精简字段
- 两列布局看板

#### 5.3 手机端（<768px）
- 底部导航栏
- 卡片列表展示
- 单列布局
- 表单堆叠排列

---

## 页面结构

### 页面路由

```
/                    # 重定向到 /dashboard
/login               # 登录页
/dashboard           # 数据看板
/customers           # 客户列表
/customers/new       # 新增客户
/customers/:id/edit  # 编辑客户
```

### 页面布局

#### 认证布局（登录页）
```
┌─────────────────────────────────┐
│         登录表单居中             │
│     Logo + 标题 + 表单           │
└─────────────────────────────────┘
```

#### 应用布局（其他页面）
```
┌─────────────────────────────────┐
│         顶部导航栏              │
├────────┬────────────────────────┤
│        │                        │
│ 侧边栏 │      主内容区域        │
│ 导航   │                        │
│        │                        │
└────────┴────────────────────────┘
```

---

## 数据模型

### Customer（客户）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 主键，UUID |
| name | String | 是 | 客户姓名 |
| company | String | 否 | 所属公司 |
| position | String | 否 | 职位 |
| email | String | 否 | 邮箱 |
| phone | String | 否 | 电话 |
| source | Enum | 否 | 来源：website/phone/referral/exhibition/other |
| status | Enum | 否 | 状态：prospect/interested/deal/lost |
| notes | String | 否 | 备注信息 |
| createdAt | DateTime | 是 | 创建时间 |
| updatedAt | DateTime | 是 | 更新时间 |

### User（用户）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 主键，UUID |
| username | String | 是 | 用户名 |
| email | String | 是 | 邮箱 |
| password | String | 是 | 密码（加密存储） |
| createdAt | DateTime | 是 | 创建时间 |

---

## API 接口设计

### 认证接口

```
POST /api/auth/login
请求体：{ username: string, password: string }
响应体：{ token: string, user: User }

POST /api/auth/logout
响应体：{ success: boolean }

GET /api/auth/me
响应体：{ user: User }
```

### 客户接口

```
GET /api/customers
查询参数：page, pageSize, search, status, source, sortBy, sortOrder
响应体：{ data: Customer[], total: number, page: number, pageSize: number }

GET /api/customers/:id
响应体：{ customer: Customer }

POST /api/customers
请求体：{ name, company, position, email, phone, source, status, notes }
响应体：{ customer: Customer }

PUT /api/customers/:id
请求体：{ name, company, position, email, phone, source, status, notes }
响应体：{ customer: Customer }

DELETE /api/customers/:id
响应体：{ success: boolean }

POST /api/customers/batch-delete
请求体：{ ids: string[] }
响应体：{ success: boolean, count: number }
```

### 统计接口

```
GET /api/stats/overview
响应体：{
  totalCustomers: number,
  newThisMonth: number,
  activeCustomers: number,
  dealCustomers: number
}

GET /api/stats/by-source
响应体：{ source: string, count: number }[]

GET /api/stats/by-status
响应体：{ status: string, count: number }[]

GET /api/stats/trend
查询参数：months: number
响应体：{ month: string, count: number }[]
```

---

## 设计规范

### 色彩方案（参考小满OKKi）

- **主色调**：蓝色系（#2563EB, #3B82F6）
- **辅助色**：浅蓝背景（#EFF6FF, #DBEAFE）
- **强调色**：橙色（#F97316）用于 CTA 按钮
- **文字色**：深灰（#1F2937）、中灰（#6B7280）、浅灰（#9CA3AF）
- **成功色**：绿色（#10B981）
- **警告色**：黄色（#F59E0B）
- **错误色**：红色（#EF4444）

### 字体规范

- **字体家族**：系统默认字体栈
- **标题**：20-24px，font-weight: 600
- **正文**：14-16px，font-weight: 400
- **标签**：12-14px，font-weight: 500

### 间距规范

- **xs**：4px
- **sm**：8px
- **md**：16px
- **lg**：24px
- **xl**：32px

### 圆角规范

- **sm**：4px
- **md**：8px
- **lg**：12px

### 阴影规范

- **sm**：轻阴影，卡片悬停
- **md**：中等阴影，下拉菜单
- **lg**：强阴影，弹窗

---

## 技术栈

### 前端
- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui 组件库
- Recharts 图表库
- React Router DOM
- Axios

### 后端
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT 认证
- bcryptjs 密码加密

---

## 用户故事

### 故事 1：用户登录
> 作为一名用户，我希望能够通过用户名和密码登录系统，以便访问我的客户数据。

**验收标准：**
- 输入正确的用户名和密码，成功登录并跳转到看板页
- 输入错误的用户名或密码，显示错误提示
- 未填写必填项时，显示表单验证错误

### 故事 2：查看数据看板
> 作为一名用户，我希望在看板上快速了解客户整体情况，以便做出业务决策。

**验收标准：**
- 看板展示客户总数、本月新增、活跃客户、成交客户四项核心指标
- 看板展示客户来源分布饼图
- 看板展示客户趋势折线图
- 看板展示客户状态分布柱状图

### 故事 3：管理客户列表
> 作为一名用户，我希望在列表中查看和管理所有客户，以便快速找到需要的客户信息。

**验收标准：**
- 列表展示所有客户的基本信息
- 支持关键词搜索
- 支持按状态、来源筛选
- 支持分页浏览
- 支持排序功能

### 故事 4：新增客户
> 作为一名用户，我希望能够快速新增客户信息，以便及时记录新的客户资源。

**验收标准：**
- 提供完整的客户信息录入表单
- 必填项未填写时显示验证错误
- 邮箱格式不正确时显示验证错误
- 提交成功后跳转回列表页并显示成功提示

### 故事 5：编辑客户
> 作为一名用户，我希望能够修改客户信息，以便保持客户数据的准确性。

**验收标准：**
- 表单预填充现有客户信息
- 修改后保存成功显示成功提示
- 取消编辑返回列表页

### 故事 6：删除客户
> 作为一名用户，我希望能够删除不需要的客户记录，以便保持数据整洁。

**验收标准：**
- 删除前显示确认弹窗
- 确认后删除成功并刷新列表
- 取消则关闭弹窗不做操作

---

## 后续规划

### Phase 2
- 客户标签系统
- 客户跟进记录
- 任务提醒功能
- 数据导入导出

### Phase 3
- 团队协作功能
- 权限管理系统
- 操作日志审计
- 移动端 App
