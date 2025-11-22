import { useEffect, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { initializeAuth, setAuth, clearAuth, fetchUserData } from '@/stores/auth/authSlice'
import { supabase } from '@/configs/supabase'

interface AuthInitializerProps {
  children: ReactNode
}

export const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const dispatch = useAppDispatch()
  const { initialized, profile, store } = useAppSelector(state => state.auth)

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeAuth())
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch(
          setAuth({
            user: session.user,
            session: session
          })
        )
        if (!profile || !store) {
          dispatch(fetchUserData(session.user))
        }
      } else {
        dispatch(clearAuth())
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch, initialized])

  return <>{children}</>
}
