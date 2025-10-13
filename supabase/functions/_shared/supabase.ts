import { createClient } from '@supabase/supabase-js'

export function getServiceRoleClient() {
  // Initialize Service Role Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  return supabase
}

export function getClient(token?: string) {
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabase = createClient(supabaseUrl, token)
  return supabase
}
