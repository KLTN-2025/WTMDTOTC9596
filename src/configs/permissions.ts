import type { UserRole } from '@/types/permissions'

export const hasRole = (
  userRole: UserRole | null | undefined,
  allowedRoles: UserRole[]
): boolean => {
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}
