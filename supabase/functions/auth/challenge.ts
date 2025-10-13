/**
 * Challenge Generation Handler
 * 
 * This module generates cryptographic challenges for wallet-based authentication.
 * It follows the EIP-4361 standard for Sign-In with Ethereum, adapted for Tezos.
 * 
 * Challenge Generation Process:
 * 1. Extract wallet address from URL path
 * 2. Generate a cryptographically secure random nonce
 * 3. Store nonce in database with expiration time
 * 4. Create message payload following EIP-4361 format
 * 5. Return challenge message and nonce to client
 * 
 * Security Features:
 * - Cryptographically secure random nonce generation
 * - Nonce expiration (10 minutes) prevents replay attacks
 * - EIP-4361 compliant message format
 * - Proper client URL extraction for domain validation
 */

import { getClient } from "../_shared/supabase.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createMessagePayload } from './@siwt/sdk/index.esm.js'
import crypto from 'crypto'

// Types
import type { ChallengeResponseData } from "./types/index.d.ts"

/**
 * Handles challenge generation for wallet authentication.
 * 
 * @param req - HTTP request containing wallet address in URL path
 * @returns HTTP response with challenge message and nonce
 * 
 * URL Format: GET /auth/challenge/{wallet_address}
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,    // EIP-4361 formatted message to sign
 *   nonce: string       // Random nonce for this challenge
 * }
 */
export async function handleChallenge(req: Request) {
  // Parse request URL to extract path and address
  const url = new URL(req.url)
  const path = url.pathname

  // Get client URL for domain validation in message
  const clientUrl = getClientUrlFromHeaders(req)
  const uri = clientUrl.origin

  // Extract wallet address from URL path: /auth/challenge/{address}
  const pathParts = path.split('/')
  const address = pathParts[pathParts.length - 1] // Get the last part of the path

  // Validate that address parameter is provided
  if (!address || address === 'challenge') {
    return new Response(JSON.stringify({ success: false, error: 'Address parameter is required in URL path' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }

  // Generate cryptographically secure random nonce
  const nonce = crypto.randomBytes(32).toString('hex')
  const issuedAt = new Date().toISOString()
  const expirationTime = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

  // Initialize Supabase client and store nonce in database
  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')
  const supabase = getClient(token)

  // Store nonce in database to prevent replay attacks
  try {
    const { error } = await supabase.from('siwt_nonces').insert(
      {
        nonce, 
        address, 
        expires_at: expirationTime
      }
    )

    if (error) {
      console.error('Error storing nonce:', error)
      return new Response(JSON.stringify({ success: false, error: 'Failed to store nonce' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }
  } catch (error) {
    console.error('Error storing nonce:', error)
    return new Response(JSON.stringify({ success: false, error: 'Failed to store nonce' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }

  // Create EIP-4361 compliant message payload using SIWT SDK
  // This follows the standard message format for Sign-In with Ethereum/Tezos
  // Reference: https://eips.ethereum.org/EIPS/eip-4361#message-format
  const messageParams = {
    domain: 'TechMarkets',                                    // Domain requesting the signature
    address: address,                                         // Wallet address to sign with
    statement: 'Sign in to TechMarkets with your Tezos wallet', // Human-readable statement
    uri: uri,                                                 // Origin of the request
    version: '1',                                             // Message format version
    chainId: 'NetXdQprcVkpaWU',                             // Tezos mainnet chain ID
    nonce,                                                    // Random nonce for this challenge
    issuedAt,                                                 // Timestamp when challenge was issued
    expirationTime                                            // When this challenge expires
  }
  const messagePayload = createMessagePayload(messageParams)
  
  // Return challenge message and nonce to client
  return new Response(JSON.stringify({
    success: true,
    message: messagePayload,
    nonce
  } as ChallengeResponseData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  })
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
