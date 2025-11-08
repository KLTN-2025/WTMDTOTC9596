import { type ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

interface PublicRouteProps {
  children: ReactNode
  redirectTo?: string
  redirectIfAuthenticated?: boolean
}

export function PublicRoute({
  children,
  redirectTo = '/',
  redirectIfAuthenticated = false
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (redirectIfAuthenticated && isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
