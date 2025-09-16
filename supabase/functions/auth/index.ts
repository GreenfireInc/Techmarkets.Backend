import { createClient } from '@supabase/supabase-js'
import { createMessagePayload, verify } from './@siwt/sdk/index.esm.js'
import { z } from 'zod'
import express from 'express'

console.log('Auth function up and running!')

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
  payload: string;
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

const app = express()
app.use(express.json())

const port = 3000

// Generate a message to sign for authentication
app.post('/auth/challenge', handleChallenge)

// Authenticate an account using Tezos
app.post('/auth/wallet', handleAuthenticateWallet)

// Link a Tezos account to an existing user
app.post('/auth/link-wallet')

// Verify seller requirements
app.post('/auth/verify-seller')

// Get user profile
app.get('/auth/profile')

async function handleChallenge(req, res) {
  const body = req.body
  if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
    return res.status(400).json({ success: false, error: 'Invalid JSON body' } as ResponseData)
  }
  const expectedDomain = Deno.env.get('ALLOWED_DOMAIN') || 'techmarkets.io'
}

async function handleAuthenticateWallet(req, res) {
  const body = req.body
      if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
        return res.status(400).json({ success: false, error: 'Invalid JSON body' } as ResponseData)
      }

      const parsed = siwtRequestSchema.safeParse(body)
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Validation failed' } as ResponseData)
      }

      const requestBody = parsed.data
      const { message, signature, address } = requestBody

      // Validate domain
      const expectedDomain = Deno.env.get('ALLOWED_DOMAIN') || 'techmarkets.io'
      if (message.domain !== expectedDomain) {
        return res.status(401).json({
          success: false,
          error: `Invalid domain. Expected: ${expectedDomain}, Got: ${message.domain}`,
        } as ResponseData)
      }

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Validate nonce (prevent replay attacks)
      const nonceValidation = await validateNonce(supabase, message.nonce, address)
      if (!nonceValidation.valid) {
        return res.status(401).json({
          success: false,
          error: nonceValidation.error || 'Invalid nonce',
        } as ResponseData)
      }

      // Format and verify message
      const messageString = formatMessage(message)
      try {
        const isValid = verify(messageString, address, signature, message.domain, message.nonce)
        if (!isValid) {
          return res.status(401).json({ success: false, error: 'Invalid signature' } as ResponseData)
        }
      } catch (verificationError) {
        console.error('Signature verification error:', verificationError)
        return res.status(401).json({ success: false, error: 'Signature verification failed' } as ResponseData)
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
        return res.status(500).json({ success: false, error: 'Failed to create session' } as ResponseData)
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          address: user.address,
          email: user.email,
          session: sessionData.session,
        },
      } as ResponseData)
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
