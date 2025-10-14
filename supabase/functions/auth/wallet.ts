/**
 * Wallet Authentication Handler
 * 
 * This module handles the verification of signed challenges from Tezos wallets
 * and manages the authentication flow for both new and existing users.
 * 
 * The authentication process follows this flow:
 * 1. Client submits signed challenge with wallet address, public key, and signature
 * 2. Server validates the nonce to prevent replay attacks
 * 3. Server verifies the cryptographic signature using the SIWT SDK
 * 4. Server checks if user exists in the database
 * 5. Returns appropriate response (new user temp token or existing user session)
 * 
 * Security Features:
 * - Nonce validation prevents replay attacks
 * - Cryptographic signature verification ensures authenticity
 * - Temporary tokens for new user onboarding
 * - Proper error handling and logging
 */

import { getServiceRoleClient } from '../_shared/supabase.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verify } from './@siwt/sdk/index.esm.js'
import { sign as signJWT } from 'jsonwebtoken'
import { AuthResponseData, NewSiwtUserData } from './types/index.d.ts'
import { getPkhfromPk } from '@taquito/utils'

/**
 * Handles wallet authentication by verifying signed challenges.
 * 
 * @param req - HTTP request containing signed challenge data
 * @returns HTTP response with authentication result
 * 
 * Request Body:
 * {
 *   address: string,      // Tezos wallet address
 *   challenge: object,    // Challenge object from /auth/challenge endpoint
 *   pubkey: string,       // Public key of the wallet
 *   signature: string     // Signature of the challenge message
 * }
 * 
 * Response:
 * - New user: Temporary token for account creation
 * - Existing user: Authentication tokens and profile data (TODO)
 */
export async function handleAuthenticateWallet(req: Request) {
  // Parse and validate request body
  let body
  try {
    body = await req.json()
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }

  // Ensure body exists and is not empty
  if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }

  // Extract authentication data from request body
  const { challenge, pubkey, signature } = body
  const address = getPkhfromPk(pubkey)
  const messagePayload = challenge.message.payload
  
  // Get nonce from challenge for validation
  const nonce = challenge.nonce
  
  // Initialize Supabase client with authorization header
  const supabase = getServiceRoleClient()
  
  // Validate nonce to prevent replay attacks
  // This ensures the challenge hasn't been used before and isn't expired
  const nonceValidation = await validateNonce(supabase, address, nonce)
  if (!nonceValidation.success) {
    return new Response(JSON.stringify(nonceValidation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
  
  // Verify the cryptographic signature using SIWT SDK
  // This ensures the message was actually signed by the wallet owner
  try {
    const expectedDomain = 'TechMarkets'
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

  // Check if user already exists in the database
  let user = await getUserByWalletAddress(supabase, address)
  if (!user) {
    // New user flow: Generate temporary token for account creation
    const temporaryToken = await generateTemporaryToken(address)
    const newUserResponse: AuthResponseData = {
      success: true,
      user_exists: false,
      data: {
        type: 'new_siwt_user',
        temporary_token: temporaryToken,
        expires_at: Date.now() + 15 * 60 * 1000, // 15 minutes from now
      } as NewSiwtUserData
    }
    return new Response(JSON.stringify(newUserResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }

  // Return existingUserResponse
  const clientUrl = getClientUrlFromHeaders(req)
  const { data: sessionData, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email,
    options: {
      redirectTo: `${clientUrl.origin}/auth/callback?type=existing_siwt_user`
    }
  })

  if (error) throw error

  const existingUserResponse: AuthResponseData = {
    success: true,
    user_exists: true,
    data: {
      type: 'existing_siwt_user',
      action_link: sessionData.properties.action_link
    }
  }

  return new Response(JSON.stringify(existingUserResponse), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  })
}

/**
 * Validates a nonce to prevent replay attacks and ensure challenge freshness.
 * 
 * @param supabase - Supabase client instance
 * @param address - Wallet address associated with the nonce
 * @param providedNonce - Nonce value to validate
 * @returns Validation result with success status and error message if failed
 */
async function validateNonce(supabase: any, address: string, providedNonce: string) {
  try {
    const { data: nonce, error } = await supabase
      .from('siwt_nonces')
      .select('*')
      .eq('address', address)
      .eq('nonce', providedNonce)
      .single()

    if (error || !nonce) {
      console.error('Nonce not found:', error)
      return {
        success: false,
        error: 'Invalid nonce provided'
      }
    }

    // Check if nonce is expired
    const now = new Date()
    const expiresAt = new Date(nonce.expires_at)
    const isExpired = now > expiresAt

    // Check if nonce has been used
    const isUsed = nonce.used_at !== null

    if (isExpired) {
      console.error('Nonce is expired')
      return {
        success: false,
        error: 'Nonce has expired'
      }
    }

    if (isUsed) {
      console.error('Nonce has already been used')
      return {
        success: false,
        error: 'Nonce has already been used'
      }
    }

    // Mark nonce as used
    const { error: updateError } = await supabase
      .from('siwt_nonces')
      .update({ 
        used_at: now.toISOString(),
        status: 'used'
      })
      .eq('id', nonce.id)

    if (updateError) {
      console.error('Error marking nonce as used:', updateError)
      return {
        success: false,
        error: 'Failed to mark nonce as used'
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Error validating nonce:', error)
    return {
      success: false,
      error: 'Internal error during nonce validation'
    }
  }
}


/**
 * Retrieves a user profile by wallet address.
 * 
 * @param supabase - Supabase client instance
 * @param address - Wallet address to search for
 * @returns User profile object or null if not found
 */
async function getUserByWalletAddress(supabase: any, address: string) {
  const { data: existingProfile, error } = await supabase
    .from('siwt_users')
    .select('*')
    .eq('wallet_address', address)

  if (error) {
    console.error('Error getting profile by address:', error)
    throw error
  }

  if (!existingProfile[0] || !existingProfile[0].wallet_address) {
    return null
  }

  return existingProfile[0]
}

/**
 * Generates a temporary JWT token for new user account creation.
 * This token allows new users to complete their profile setup.
 * 
 * @param address - Wallet address to include in the token
 * @returns JWT token string with 10-minute expiration
 */
async function generateTemporaryToken(address: string) {
  // Construct JWT payload with wallet address
  const payload = {
    wallet_address: address
  }
  
  // Get JWT secret from environment variables
  const secret = Deno.env.get('JWT_SECRET')
  const options = {
    algorithm: 'HS256',
    expiresIn: 600, // 10 minutes (600 seconds)
    issuer: 'TechMarkets',
    subject: 'temp_signup_token'
  }

  // Sign and return the JWT token
  const token = signJWT(payload, secret, options)
  return token
}

/**
 * Extracts the client URL from request headers for domain validation.
 * This helps with development and production environments by dynamically
 * determining the correct origin for the challenge message.
 * 
 * @param req - HTTP request object
 * @returns URL object representing the client origin
 */
function getClientUrlFromHeaders(req: Request): URL {
  // Try to get origin from CORS headers first, then referer
  const origin = req.headers.get('Origin') || req.headers.get('Referer') || ''
  try {
    return new URL(origin);
  } catch {
    // Fallback to environment variable or localhost for development
    return new URL(Deno.env.get('PUBLIC_SITE_URL') || 'http://localhost:8080');
  }
}
