import { createClient } from '@supabase/supabase-js'
import { createMessagePayload, verify } from './@siwt/sdk/index.esm.js'
import crypto from 'crypto'
import { z } from 'zod'
import { corsHeaders } from '../_shared/cors.ts'

interface SiwtMessage {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: string;
  nonce: string;
  issuedAt: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}

interface ResponseData {
  success: boolean;
  error?: string;
}

interface ChallengeResponseData extends ResponseData {
  message: string;
  nonce: string;
}

interface AuthResponseData extends ResponseData {
  user: any;
}

// Validation schema for SIWT requests
const siwtRequestSchema = z.object({
  message: z.object({
    domain: z.string(),
    address: z.string(),
    statement: z.string(),
    uri: z.string(),
    version: z.string(),
    chainId: z.string(),
    nonce: z.string(),
    issuedAt: z.string(),
    expirationTime: z.string().optional(),
    notBefore: z.string().optional(),
    requestId: z.string().optional(),
    resources: z.array(z.string()).optional(),
  }),
  signature: z.string(),
  address: z.string(),
  linkToExistingUser: z.boolean().optional(),
  existingUserId: z.string().optional(),
})

console.log('Auth function up and running!')

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const path = url.pathname
  const method = req.method

  try {
    // Route handling
    if (path.startsWith('/auth/challenge/') && method === 'GET') {
      return await handleChallenge(req)
    } else if (path === '/auth/wallet' && method === 'POST') {
      return await handleAuthenticateWallet(req)
    } else if (path === '/auth/link-wallet' && method === 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Not implemented' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 501
      })
    } else if (path === '/auth/verify-seller' && method === 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Not implemented' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 501
      })
    } else if (path === '/auth/profile' && method === 'GET') {
      return new Response(JSON.stringify({ success: false, error: 'Not implemented' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 501
      })
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }
  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

async function handleChallenge(req: Request) {
  const url = new URL(req.url)
  const path = url.pathname
  const hostname = url.hostname

  // Extract address from URL path: /auth/challenge/{address}
  const pathParts = path.split('/')
  const address = pathParts[pathParts.length - 1] // Get the last part of the path

  if (!address || address === 'challenge') {
    return new Response(JSON.stringify({ success: false, error: 'Address parameter is required in URL path' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }

  // Generate nonce
  const nonce = crypto.randomBytes(32).toString('base64url')
  const issuedAt = new Date().toISOString()
  const expirationTime = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

  // Store nonce in database
  const authorizationHeader = req.headers.get('Authorization')!
  const supabase = getSupabaseClient(authorizationHeader)

  try {
    await supabase.from('siwt_nonces').insert([
      {
        nonce, 
        address, 
        expires_at: expirationTime
      }
    ])
  } catch (error) {
    console.error('Error storing nonce:', error)
    return new Response(JSON.stringify({ success: false, error: 'Failed to store nonce' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }

  const messagePayload = createMessagePayload({
    domain: 'TechMarkets.io',
    address: address,
    statement: 'Sign in to TechMarkets with your Tezos wallet',
    uri: hostname,
    version: '1',
    chainId: 'NetXdQprcVkpaWU', // Tezos mainnet
    nonce,
    issuedAt,
    expirationTime
  })
  
  console.log('Challenge message generated: ', messagePayload)
  
  return new Response(JSON.stringify({
    success: true,
    message: messagePayload,
    nonce
  } as ChallengeResponseData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  })
}

async function handleAuthenticateWallet(req: Request) {
  let body
  try {
    body = await req.json()
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }

  if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }

  const parsed = siwtRequestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ success: false, error: 'Validation failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }

  const requestBody = parsed.data
  const { message, signature, address } = requestBody

  // Validate domain
  const expectedDomain = Deno.env.get('ALLOWED_DOMAIN') || 'techmarkets.io'
  if (message.domain !== expectedDomain) {
    return new Response(JSON.stringify({
      success: false,
      error: `Invalid domain. Expected: ${expectedDomain}, Got: ${message.domain}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401
    })
  }

  const authorizationHeader = req.headers.get('Authorization')!
  const supabase = getSupabaseClient(authorizationHeader)

  // Validate nonce (prevent replay attacks)
  const nonceValidation = await validateNonce(supabase, message.nonce, address)
  if (!nonceValidation.valid) {
    return new Response(JSON.stringify({
      success: false,
      error: nonceValidation.error || 'Invalid nonce',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401
    })
  }

  // Format and verify message
  const messageString = formatMessage(message)
  try {
    const isValid = verify(messageString, address, signature, message.domain, message.nonce)
    if (!isValid) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid signature' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }
  } catch (verificationError) {
    console.error('Signature verification error:', verificationError)
    return new Response(JSON.stringify({ success: false, error: 'Signature verification failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401
    })
  }

  // Get or create user
  let user = await getUserByAddress(supabase, address)
  if (!user) {
    if (requestBody.linkToExistingUser && requestBody.existingUserId) {
      user = await linkToExistingUser(supabase, address, requestBody.existingUserId, message)
    } else {
      user = await createUser(supabase, address, message)
    }
  }

  // Create a session for the user
  const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
    user_id: user.id,
  })

  if (sessionError) {
    console.error('Session creation error:', sessionError)
    return new Response(JSON.stringify({ success: false, error: 'Failed to create session' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }

  return new Response(JSON.stringify({
    success: true,
    user: {
      id: user.id,
      address: user.address,
      email: user.email,
      session: sessionData.session,
    },
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  })
}

function formatMessage(message: SiwtMessage): string {
  const lines = [
    `${message.domain} wants you to sign in with your Tezos account:`,
    message.address,
    '',
    message.statement,
    '',
    `URI: ${message.uri}`,
    `Version: ${message.version}`,
    `Chain ID: ${message.chainId}`,
    `Nonce: ${message.nonce}`,
    `Issued At: ${message.issuedAt}`,
  ]

  if (message.expirationTime) {
    lines.push(`Expiration Time: ${message.expirationTime}`)
  }

  if (message.notBefore) {
    lines.push(`Not Before: ${message.notBefore}`)
  }

  if (message.requestId) {
    lines.push(`Request ID: ${message.requestId}`)
  }

  if (message.resources && message.resources.length > 0) {
    lines.push('Resources:')
    message.resources.forEach(resource => {
      lines.push(`- ${resource}`)
    })
  }

  return lines.join('\n')
}

async function getUserByAddress(supabase: any, address: string) {
  // First try to find user by address in profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('address', address)
    .single()

  if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
    throw profileError
  }

  if (profile) {
    return profile
  }

  // If no profile found, check if there's an existing auth user with this address in metadata
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    throw authError
  }

  // Find user with matching Tezos address in metadata
  const existingUser = authUsers.users.find(user => 
    user.user_metadata?.address === address || 
    user.user_metadata?.tezos_address === address
  )

  if (existingUser) {
    // Create profile for existing user
    const { data: newProfile, error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        id: existingUser.id,
        address,
        wallet_type: 'tezos',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createProfileError) {
      throw createProfileError
    }

    return newProfile
  }

  return null
}

async function createUser(supabase: any, address: string, message: SiwtMessage) {
  // Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: `${address}@tezos.wallet`,
    email_confirm: true,
    user_metadata: {
      address,
      wallet_type: 'tezos',
      auth_provider: 'tezos',
      verified_at: new Date().toISOString(),
    },
  })

  if (authError) {
    throw authError
  }

  // Create profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      address,
      wallet_type: 'tezos',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (profileError) {
    throw profileError
  }

  return profile
}

async function linkToExistingUser(supabase: any, address: string, existingUserId: string, message: SiwtMessage) {
  // Verify the existing user exists
  const { data: existingUser, error: userError } = await supabase.auth.admin.getUserById(existingUserId)
  
  if (userError || !existingUser.user) {
    throw new Error('Existing user not found')
  }

  // Update existing user's metadata to include Tezos address
  const updatedMetadata = {
    ...existingUser.user.user_metadata,
    address,
    wallet_type: 'tezos',
    auth_provider: 'tezos',
    verified_at: new Date().toISOString(),
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(existingUserId, {
    user_metadata: updatedMetadata,
  })

  if (updateError) {
    throw updateError
  }

  // Create or update profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: existingUserId,
      address,
      wallet_type: 'tezos',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id'
    })
    .select()
    .single()

  if (profileError) {
    throw profileError
  }

  return profile
}

async function validateNonce(supabase: any, nonce: string, address: string) {
  try {
    // Check if this nonce has been used before
    const { data: existingNonce, error } = await supabase
      .from('siwt_nonces')
      .select('*')
      .eq('nonce', nonce)
      .eq('address', address)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error
    }

    if (existingNonce) {
      return {
        valid: false,
        error: 'Nonce already used'
      }
    }

    // Store the nonce to prevent reuse
    const { error: insertError } = await supabase
      .from('siwt_nonces')
      .insert({
        nonce,
        address,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes expiry
      })

    if (insertError) {
      throw insertError
    }

    return {
      valid: true
    }
  } catch (error) {
    console.error('Nonce validation error:', error)
    return {
      valid: false,
      error: 'Nonce validation failed'
    }
  }
}

function getSupabaseClient(authorizationHeader: any) {
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
