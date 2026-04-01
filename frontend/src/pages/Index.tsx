import { Navigate } from 'react-router-dom'

// 首页重定向到登录页或看板
const Index = () => {
  const token = localStorage.getItem('auth_token')
  return <Navigate to={token ? '/dashboard' : '/login'} replace />
}

export default Index
