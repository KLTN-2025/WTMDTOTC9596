import { type ReactNode } from 'react'
import { usePermission } from '@/hooks/usePermission'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/permissions'

interface ProtectedComponentProps {
  children: ReactNode
  roles: UserRole[]
  fallback?: ReactNode
  showIfNoRole?: boolean
  showWhileLoading?: boolean
}

export function ProtectedComponent({
  children,
  roles,
  fallback = null,
  showIfNoRole = false,
  showWhileLoading = false
}: ProtectedComponentProps) {
  const { hasRole, isRoleLoading, userRole } = usePermission()
  const { profile } = useAuth()

  // If loading role, check if we should show
  if (isRoleLoading) {
    // Only show while loading if explicitly allowed AND we have a profile with matching role
    if (showWhileLoading && profile) {
      // Double check: only show if current role matches (to avoid stale permissions)
      const currentRoleMatches = userRole && roles.includes(userRole)
      if (currentRoleMatches) {
        return <>{children}</>
      }
    }
    // Don't show during loading/account switch
    return <>{fallback}</>
  }

  // When not loading, check role access
  let hasAccess = hasRole(roles)

  if (showIfNoRole) {
    hasAccess = !hasAccess
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
