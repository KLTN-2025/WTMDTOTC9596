import { useState, useEffect } from 'react'
import { supabase } from '@/configs/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession()

        if (error) {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false
          })
          return
        }

        setAuthState({
          user: session?.user ?? null,
          session: session,
          isLoading: false,
          isAuthenticated: !!session?.user
        })
      } catch (error) {
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    checkSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session: session,
        isLoading: false,
        isAuthenticated: !!session?.user
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return authState
}
