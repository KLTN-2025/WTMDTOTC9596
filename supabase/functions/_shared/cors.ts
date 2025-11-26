import { env } from './env.ts'

export const corsHeaders = {
  'Access-Control-Allow-Origin': env.ORIGIN_URL!,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}
