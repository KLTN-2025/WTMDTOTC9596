import { type ReactNode } from 'react'
import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import { PublicRoute } from '@/components/guards/PublicRoute'

export type GuardType = 'public' | 'protected' | 'guest'

export interface RouteGuardConfig {
  type: GuardType
  redirectTo?: string
  redirectIfAuthenticated?: boolean
  fallback?: ReactNode
}

export interface GuardedRouteConfig {
  element: ReactNode
  guard?: RouteGuardConfig
}

const defaultGuards: Record<GuardType, RouteGuardConfig> = {
  public: {
    type: 'public'
  },
  protected: {
    type: 'protected',
    redirectTo: '/login'
  },
  guest: {
    type: 'public',
    redirectIfAuthenticated: true,
    redirectTo: '/'
  }
}

export function createGuardedRoute(
  element: ReactNode,
  guardConfig?: GuardType | RouteGuardConfig
): ReactNode {
  if (!guardConfig) {
    return element
  }

  const config: RouteGuardConfig =
    typeof guardConfig === 'string'
      ? defaultGuards[guardConfig]
      : { ...defaultGuards[guardConfig.type], ...guardConfig }

  switch (config.type) {
    case 'protected':
      return (
        <ProtectedRoute redirectTo={config.redirectTo!} fallback={config.fallback}>
          {element}
        </ProtectedRoute>
      )
    case 'guest':
      return (
        <PublicRoute
          redirectTo={config.redirectTo!}
          redirectIfAuthenticated={config.redirectIfAuthenticated!}
        >
          {element}
        </PublicRoute>
      )
    case 'public':
    default:
      return <PublicRoute>{element}</PublicRoute>
  }
}

export const routeGuards = {
  public: 'public' as const,
  protected: 'protected' as const,
  guest: 'guest' as const,
  custom: (config: RouteGuardConfig) => config
}
