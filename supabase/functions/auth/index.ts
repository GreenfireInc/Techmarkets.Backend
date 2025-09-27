import { verify } from './@siwt/sdk/index.esm.js'
import { corsHeaders } from '../_shared/cors.ts'
import { handleChallenge } from './challenge.ts'

console.log('Auth function up and running!')

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Parse Request URL for Route Handling
  const url = new URL(req.url)
  const path = url.pathname
  const method = req.method

  try {
    if (path.startsWith('/auth/challenge') && method === 'GET') {

      // GET /auth/challenge/{address}
      return await handleChallenge(req)

    } else if (path === '/auth/wallet' && method === 'POST') {

      // POST /auth/wallet
      return await handleAuthenticateWallet(req)

    } else if (path === '/auth/link-wallet' && method === 'POST') {

      // POST /auth/link-wallet
      return new Response(JSON.stringify({ success: false, error: 'Not implemented' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 501
      })

    } else if (path === '/auth/verify-seller' && method === 'POST') {

      // POST /auth/verify-seller
      return new Response(JSON.stringify({ success: false, error: 'Not implemented' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 501
      })

    } else if (path === '/auth/profile' && method === 'GET') {

      // GET /auth/profile
      return new Response(JSON.stringify({ success: false, error: 'Not implemented' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 501
      })

    } else {

      // 404 Not found
      return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })

    }
  } catch (error) {

    // 500 Internal server error
    console.error('Function error:', error)
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })

  }
})

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

  const { address, challenge, pubkey, signature } = body
  const messagePayload = challenge.message.payload
  
  // Deconstruct domain and nonce from message
  const expectedDomain = 'TechMarkets'
  // WIP
  // THIS NONCE MUST BE VALIDATED THROUGH DATABASE
  // AN EXPIRED OR USED NONCE SHOULD NOT BE ACCEPTED
  // THROW ERROR IF NONCE INVALID
  const nonce = challenge.nonce
  
  try {
    console.log({ messagePayload, pubkey, signature, expectedDomain, nonce })
    const isValid = verify(messagePayload, pubkey, signature, expectedDomain, nonce)
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
  // let user = await getUserByAddress(supabase, address)
  // if (!user) {
  //   if (body.linkToExistingUser && body.existingUserId) {
  //     user = await linkToExistingUser(supabase, address, body.existingUserId, messagePayload)
  //   } else {
  //     user = await createUser(supabase, address, messagePayload)
  //   }
  // }

  // Create a session for the user
  // const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
  //   user_id: user.id,
  // })

  // if (sessionError) {
  //   console.error('Session creation error:', sessionError)
  //   return new Response(JSON.stringify({ success: false, error: 'Failed to create session' }), {
  //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  //     status: 500
  //   })
  // }

  return new Response(JSON.stringify({
    success: true,
    user: {}
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  })
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
