import { createClient } from '@supabase/supabase-js'
import { env } from './env.ts'
export const supabaseAdmin = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!)
export const supabaseClient = createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!)
