/**
 * TechMarkets Authentication Edge Function
 * 
 * This edge function provides SIWT (Sign In With Tezos) authentication for the TechMarkets platform.
 * It implements a secure wallet-based authentication flow using Tezos blockchain signatures.
 * 
 * Authentication Flow:
 * 1. Client requests challenge for wallet address
 * 2. Client signs the challenge message with their Tezos wallet
 * 3. Client submits signed message for verification
 * 4. Server verifies signature and returns authentication tokens
 * 
 * Supported Endpoints:
 * - GET  /auth/challenge/{address}  - Generate authentication challenge
 * - POST /auth/wallet              - Verify signed challenge and authenticate
 * - POST /auth/link-wallet         - Link additional wallet (planned)
 * - POST /auth/verify-seller       - Verify seller status (planned)
 * - GET  /auth/profile             - Get user profile (planned)
 * 
 * Security Features:
 * - Nonce-based challenge system to prevent replay attacks
 * - Cryptographic signature verification using Tezos wallet
 * - Temporary tokens for new user onboarding
 * - CORS protection for cross-origin requests
 */

import { corsHeaders } from '../_shared/cors.ts'
import { handleChallenge } from './challenge.ts'
import { handleAuthenticateWallet } from './wallet.ts'

console.log('Auth function up and running!')

/**
 * Main request handler for the authentication edge function.
 * Routes incoming requests to appropriate handlers based on path and method.
 * 
 * @param req - The incoming HTTP request
 * @returns HTTP response with authentication data or error message
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests for browser security
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Parse request URL components for routing
  const url = new URL(req.url)
  const path = url.pathname
  const method = req.method

  try {
    // Route: GET /auth/challenge/{address}
    // Generates a cryptographic challenge for wallet signature authentication
    // Returns a message payload and nonce that the client must sign with their Tezos wallet
    if (path.startsWith('/auth/challenge') && method === 'GET') {
      return await handleChallenge(req)

    // Route: POST /auth/wallet
    // Verifies the signed challenge and authenticates the user
    // Returns authentication tokens for existing users or temporary tokens for new users
    } else if (path === '/auth/wallet' && method === 'POST') {
      return await handleAuthenticateWallet(req)

    // Route: POST /auth/link-wallet
    // Links an additional wallet to an existing user account
    // TODO: Implement wallet linking functionality
    } else if (path === '/auth/link-wallet' && method === 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Not implemented' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 501
      })

    // Route: POST /auth/verify-seller
    // Verifies and grants seller status to a user
    // TODO: Implement seller verification process
    } else if (path === '/auth/verify-seller' && method === 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Not implemented' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 501
      })

    // Route: GET /auth/profile
    // Retrieves the current user's profile information
    // TODO: Implement profile retrieval functionality
    } else if (path === '/auth/profile' && method === 'GET') {
      return new Response(JSON.stringify({ success: false, error: 'Not implemented' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 501
      })

    // 404 - Route not found
    // Return error for any unmatched routes
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }
  } catch (error) {
    // Global error handler - catches any unhandled exceptions
    // Logs the error for debugging and returns a generic error response
    console.error('Function error:', error)
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
