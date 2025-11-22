import { type ReactNode } from 'react'
import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import { PublicRoute } from '@/components/guards/PublicRoute'
import { RoleProtectedRoute } from '@/components/guards/RoleProtectedRoute'
import type { UserRole } from '@/types/permissions'
import { PATHS } from '@/configs/paths'

export type GuardType = 'public' | 'protected' | 'guest' | 'role'

export interface RouteGuardConfig {
  type: GuardType
  redirectTo?: string
  redirectIfAuthenticated?: boolean
  fallback?: ReactNode
  roles?: UserRole[]
}

export interface GuardedRouteConfig {
  element: ReactNode
  guard?: RouteGuardConfig
}

const defaultGuards: Partial<Record<GuardType, RouteGuardConfig>> = {
  public: {
    type: 'public'
  },
  protected: {
    type: 'protected',
    redirectTo: PATHS.LOGIN
  },
  guest: {
    type: 'guest',
    redirectIfAuthenticated: true,
    redirectTo: PATHS.HOME
  }
}

export function createGuardedRoute(
  element: ReactNode,
  guardConfig?: GuardType | RouteGuardConfig
): ReactNode {
  if (!guardConfig) {
    return element
  }

  let config: RouteGuardConfig
  if (typeof guardConfig === 'string') {
    const defaultConfig = defaultGuards[guardConfig]
    config = defaultConfig || { type: guardConfig }
  } else {
    const defaultConfig = defaultGuards[guardConfig.type]
    config = defaultConfig ? { ...defaultConfig, ...guardConfig } : guardConfig
  }

  switch (config.type) {
    case 'protected':
      return (
        <ProtectedRoute redirectTo={config.redirectTo!} fallback={config.fallback}>
          {element}
        </ProtectedRoute>
      )
    case 'role':
      return (
        <RoleProtectedRoute
          redirectTo={config.redirectTo || PATHS.ROOT}
          fallback={config.fallback}
          roles={config.roles!}
        >
          {element}
        </RoleProtectedRoute>
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
  role: (roles: UserRole[], redirectTo?: string): RouteGuardConfig => {
    const config: RouteGuardConfig = {
      type: 'role',
      roles
    }
    if (redirectTo !== undefined) {
      config.redirectTo = redirectTo
    }
    return config
  },
  custom: (config: RouteGuardConfig) => config
}
