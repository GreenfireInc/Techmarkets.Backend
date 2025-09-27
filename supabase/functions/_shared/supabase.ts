import { createClient } from '@supabase/supabase-js'

export function getClient(authorizationHeader: any) {
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: { Authorization: authorizationHeader }
    }
  })
  return supabase
}
