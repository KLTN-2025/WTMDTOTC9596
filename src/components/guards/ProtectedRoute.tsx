import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { Box, Spinner, Text, VStack } from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
  fallback?: ReactNode
}

export function ProtectedRoute({ children, redirectTo = '/login', fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      fallback || (
        <Box display='flex' alignItems='center' justifyContent='center' minH='100vh' bg='#F8FAFC'>
          <VStack gap={4}>
            <Spinner size='xl' color='#204ED3' />
            <Text fontSize='16px' color='#6B7280'>
              Đang tải...
            </Text>
          </VStack>
        </Box>
      )
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}
