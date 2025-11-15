import { createClient } from '@supabase/supabase-js'
import { env } from '@/configs/env'

export const supabase = createClient(env.BACKEND_URL, env.BACKEND_PUBLISHABLE_KEY)

export const lambdaSupabase = createClient(env.BACKEND_URL, env.BACKEND_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    storageKey: 'lambda-supabase-auth-token'
  }
})
