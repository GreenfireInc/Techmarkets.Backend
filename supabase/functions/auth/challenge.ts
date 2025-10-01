import { getClient } from "../_shared/supabase.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createMessagePayload } from './@siwt/sdk/index.esm.js'
import crypto from 'crypto'

// Types
import { ChallengeResponseData } from "./types/index.d.ts"

export async function handleChallenge(req: Request) {
  const url = new URL(req.url)
  const path = url.pathname

  const clientUrl = getClientUrlFromHeaders(req)
  const uri = clientUrl.origin

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
  const nonce = crypto.randomBytes(32).toString('hex')
  const issuedAt = new Date().toISOString()
  const expirationTime = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

  // Store nonce in database
  const authorizationHeader = req.headers.get('Authorization')!
  const supabase = getClient(authorizationHeader)
  try {
    const { error } = await supabase.from('siwt_nonces').insert(
      {
        nonce, 
        address, 
        expires_at: expirationTime
      }
    )

    if (error) {
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

  // Using createMessagePayload method in @siwt/sdk module
  // This follows the message format declared by EIP-4361
  // https://eips.ethereum.org/EIPS/eip-4361#message-format
  const messageParams = {
    domain: 'TechMarkets',
    address: address,
    statement: 'Sign in to TechMarkets with your Tezos wallet',
    uri: uri,
    version: '1',
    chainId: 'NetXdQprcVkpaWU', // Tezos mainnet
    nonce,
    issuedAt,
    expirationTime
  }
  const messagePayload = createMessagePayload(messageParams)
  
  return new Response(JSON.stringify({
    success: true,
    message: messagePayload,
    nonce
  } as ChallengeResponseData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  })
}

// Unsure if client Url should be added using this method or statically set
// This method aids with development using http://localhost:8080
function getClientUrlFromHeaders(req: Request): URL {
  const origin = req.headers.get('Origin') || req.headers.get('Referer') || ''
  try {
    return new URL(origin);
  } catch {
    // Final fallback: configurable site URL or localhost
    return new URL(Deno.env.get('PUBLIC_SITE_URL') || 'http://localhost:8080');
  }
}
