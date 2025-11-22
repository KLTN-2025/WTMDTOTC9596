import { type ReactNode } from 'react'
import { usePermission } from '@/hooks/usePermission'
import type { UserRole } from '@/types/permissions'

interface ProtectedComponentProps {
  children: ReactNode
  roles: UserRole[]
  fallback?: ReactNode
  showIfNoRole?: boolean
}

export function ProtectedComponent({
  children,
  roles,
  fallback = null,
  showIfNoRole = false
}: ProtectedComponentProps) {
  const { hasRole } = usePermission()

  let hasAccess = hasRole(roles)

  if (showIfNoRole) {
    hasAccess = !hasAccess
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
