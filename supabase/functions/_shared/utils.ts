import { z, ZodError } from 'zod'
import { corsHeaders } from './cors.ts'

export const validateBody = async <T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<T | Response> => {
  const payload = await req.json()
  try {
    return schema.parse(payload) as T
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as ZodError).message }), {
      status: 400,
      headers: new Headers({ ...corsHeaders, 'Content-Type': 'application/json' })
    })
  }
}
