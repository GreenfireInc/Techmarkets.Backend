import { verify } from './@siwt/sdk/index.esm.js'
import { corsHeaders } from '../_shared/cors.ts'
import { handleChallenge } from './challenge.ts'
import { handleAuthenticateWallet } from './wallet.ts'

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
