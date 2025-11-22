import type { UserRole } from '@/types/permissions'
import { hasRole } from '@/configs/permissions'

export const checkRole = (
  userRole: UserRole | null | undefined,
  allowedRoles: UserRole[]
): boolean => {
  return hasRole(userRole, allowedRoles)
}
