import { createClient } from '@supabase/supabase-js'
import { env } from '@/configs/env'
export const supabase = createClient(env.BACKEND_URL, env.BACKEND_PUBLISHABLE_KEY)
