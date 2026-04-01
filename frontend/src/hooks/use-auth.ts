import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient, getErrorMessage } from '@/lib/api-client'
import { User } from '@/types'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

// 从 localStorage 初始化状态
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false, isLoading: true }
  }

  const token = localStorage.getItem(TOKEN_KEY)
  const userStr = localStorage.getItem(USER_KEY)

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr) as User
      return { user, token, isAuthenticated: true, isLoading: false }
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }

  return { user: null, token: null, isAuthenticated: false, isLoading: true }
}

export function useAuth() {
  const navigate = useNavigate()
  const [state, setState] = useState<AuthState>(getInitialState)

  // 登录
  const login = useCallback(async (username: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))
      const response = await apiClient.post('/auth/login', { username, password })
      const { token, user } = response.data

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      setState({ user, token, isAuthenticated: true, isLoading: false })
      toast.success('登录成功')
      navigate('/dashboard')
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      const message = getErrorMessage(error)
      toast.error(message || '登录失败')
      throw error
    }
  }, [navigate])

  // 注册
  const register = useCallback(async (username: string, email: string, password: string, name?: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))
      const response = await apiClient.post('/auth/register', { username, email, password, name })
      const { token, user } = response.data

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      setState({ user, token, isAuthenticated: true, isLoading: false })
      toast.success('注册成功')
      navigate('/dashboard')
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      const message = getErrorMessage(error)
      toast.error(message || '注册失败')
      throw error
    }
  }, [navigate])

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
    toast.success('已退出登录')
    navigate('/login')
  }, [navigate])

  // 检查认证状态
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false, isAuthenticated: false }))
      return false
    }

    try {
      const response = await apiClient.get('/auth/me')
      const { user } = response.data
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      setState({ user, token, isAuthenticated: true, isLoading: false })
      return true
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
      return false
    }
  }, [])

  return {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  }
}
