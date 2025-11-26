import '@supabase/functions-js/edge-runtime.d.ts'
import { supabaseAdmin, supabaseClient } from '../_shared/supabase.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { z } from 'zod'
import { validateBody } from '../_shared/utils.ts'

const userSchema = z.object({
  email: z.email().optional(),
  phone: z.string(),
  full_name: z.string(),
  role: z.enum(['buyer', 'seller', 'admin']),
  password: z.string().optional(),
  user_id: z.string().optional(),
  status: z.enum(['active', 'banned']).optional()
})
const userUpdateSchema = userSchema.partial().refine(data => data.user_id, {
  message: 'user_id is required'
})
type UserSchema = z.infer<typeof userSchema>
type UserUpdateSchema = z.infer<typeof userUpdateSchema>
const headers = new Headers({ ...corsHeaders, 'Content-Type': 'application/json' })

const handleCreateUser = async (payload: UserSchema) => {
  const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
    email: payload?.email,
    email_confirm: payload.email ? true : false,
    password: payload.password,
    phone: payload.phone,
    user_metadata: {
      full_name: payload.full_name,
      role: payload.role
    },
    phone_confirm: true
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to create user' }), {
      status: 400,
      headers
    })
  }
  const { data: profileData, error: profileError } = await supabaseClient
    .from('profiles')
    .insert({
      id: authData.user.id,
      status: 'active',
      full_name: payload.full_name,
      phone: payload.phone,
      email: payload.email,
      role: payload.role
    })
    .select()
    .single()
  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return new Response(JSON.stringify({ error: profileError.message }), {
      status: 400,
      headers
    })
  }

  return new Response(JSON.stringify({ data: profileData }), {
    status: 200,
    headers
  })
}
const handleUpdateUser = async (payload: UserUpdateSchema) => {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(payload.user_id!, {
    email: payload.email,
    email_confirm: payload.email ? true : false,
    phone: payload.phone,
    user_metadata: {
      full_name: payload.full_name,
      role: payload.role
    },
    ban_duration: payload.status === 'banned' ? '876000h' : '1ns'
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers
    })
  }
  const { data: profileData, error: profileError } = await supabaseClient
    .from('profiles')
    .update({
      full_name: payload.full_name,
      phone: payload.phone,
      email: payload.email,
      role: payload.role,
      status: payload.status
    })
    .eq('id', payload.user_id!)
    .select()
    .single()

  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), {
      status: 400,
      headers
    })
  }
  return new Response(JSON.stringify({ data: profileData }), {
    status: 200,
    headers
  })
}

Deno.serve(async req => {
  try {
    const method = req.method
    switch (method) {
      case 'OPTIONS': {
        return new Response(null, { status: 204, headers })
      }
      case 'POST': {
        const data = await validateBody<UserSchema>(req, userSchema)
        if (data instanceof Response) {
          return data
        }
        return handleCreateUser(data)
      }
      case 'PUT': {
        const data = await validateBody<UserUpdateSchema>(req, userUpdateSchema)
        if (data instanceof Response) {
          return data
        }
        return handleUpdateUser(data)
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid method' }), {
          status: 400,
          headers
        })
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Internal server error' }),
      {
        status: 500,
        headers
      }
    )
  }
})
