import { createClient } from '@supabase/supabase-js'

/**
 * Creates and returns a Supabase client with service role privileges.
 * This client bypasses Row Level Security (RLS) and should only be used in server-side contexts.
 * 
 * @returns {SupabaseClient} A Supabase client with admin privileges
 * @throws {Error} If required environment variables are not set
 */
export function getServiceRoleClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  if (!supabaseUrl) throw new Error('Missing SUPABASE_URL environment variable')
  
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  if (!supabaseServiceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

/**
 * Creates and returns a standard Supabase client with the provided JWT token.
 * This client respects Row Level Security (RLS) policies.
 * 
 * @param {string} [token] - Optional JWT token for authentication
 * @returns {SupabaseClient} A Supabase client instance
 * @throws {Error} If SUPABASE_URL environment variable is not set
 */
export function getClient(token?: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  if (!supabaseUrl) throw new Error('Missing SUPABASE_URL environment variable')
  
  return createClient(supabaseUrl, token || '')
}
