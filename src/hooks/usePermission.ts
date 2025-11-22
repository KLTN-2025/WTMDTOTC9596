import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { hasRole } from '@/configs/permissions'
import type { UserRole } from '@/types/permissions'

export function usePermission() {
  const { profile, isAuthenticated } = useAuth()
  const userRole = profile?.role || null
  const isRoleLoading = isAuthenticated && !userRole

  const checkRole = useMemo(
    () => (allowedRoles: UserRole[]) => {
      return hasRole(userRole, allowedRoles)
    },
    [userRole]
  )

  return {
    userRole,
    isAuthenticated,
    hasRole: checkRole,
    isRoleLoading,
    isAdmin: userRole === 'admin',
    isSeller: userRole === 'seller',
    isBuyer: userRole === 'buyer'
  }
}
