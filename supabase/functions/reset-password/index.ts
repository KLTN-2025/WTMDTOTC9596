// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import '@supabase/functions-js/edge-runtime.d.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async req => {
  const headers = new Headers({ ...corsHeaders, 'Content-Type': 'application/json' })
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }
    const { phoneNumber, newPassword } = await req.json()

    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const user = users.users.find(user => user.phone === phoneNumber)
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
        headers
      })
    }

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword
    })

    return new Response(JSON.stringify({ message: 'Password reset successfully' }), {
      status: 200,
      headers
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ message: (error as Error).message || 'Internal server error' }),
      {
        status: 500,
        headers
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reset-password' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
