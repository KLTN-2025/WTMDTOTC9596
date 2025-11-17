import { useAppSelector } from '@/stores/hooks'
import type { User, Session } from '@supabase/supabase-js'
import type { Store } from '@/types/stores'
import type { Profile } from '@/api/profile'

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  store: Store | null
  profile: Profile | null
}

export function useAuth(): AuthState {
  const authState = useAppSelector(state => state.auth)

  return {
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    store: authState.store,
    profile: authState.profile
  }
}
