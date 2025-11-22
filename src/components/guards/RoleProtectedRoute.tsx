import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { Box, Spinner, Text, VStack } from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import type { UserRole } from '@/types/permissions'
import { PATHS } from '@/configs/paths'

interface RoleProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
  fallback?: ReactNode
  roles: UserRole[]
}

export function RoleProtectedRoute({
  children,
  redirectTo = PATHS.ROOT,
  fallback,
  roles
}: RoleProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const { hasRole, isRoleLoading } = usePermission()
  const location = useLocation()

  const renderFallback = fallback || (
    <Box display='flex' alignItems='center' justifyContent='center' minH='100vh' bg='#F8FAFC'>
      <VStack gap={4}>
        <Spinner size='xl' color='#204ED3' />
        <Text fontSize='16px' color='#6B7280'>
          Đang tải...
        </Text>
      </VStack>
    </Box>
  )

  if (isLoading || (isAuthenticated && isRoleLoading)) {
    return renderFallback
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />
  }

  if (!hasRole(roles)) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}
