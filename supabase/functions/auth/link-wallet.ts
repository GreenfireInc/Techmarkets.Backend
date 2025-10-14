import { getClient, getServiceRoleClient } from '../_shared/supabase.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verify as verifyJWT } from 'jsonwebtoken'

type LinkWalletRequest = {
  temporary_token: string;
};

/**
 * Links an authenticated wallet to an existing user account.
 * 
 * This endpoint allows users to associate a wallet address with their existing account.
 * It verifies a temporary JWT token containing the wallet address and updates the user's metadata
 * in Supabase Auth with the new wallet address.
 * 
 * @param {Request} req - The incoming HTTP request containing:
 *   - `temporary_token`: A JWT containing the wallet address to be linked
 * 
 * @returns {Promise<Response>} A response with:
 *   - Success: { success: true, data: updatedUser } with 200 status
 *   - Error: { success: false, error: string } with appropriate status code
 * 
 * @example
 * // Request
 * POST /auth/link-wallet
 * {
 *   "temporary_token": "jwt.token.here"
 * }
 * 
 * // Success Response
 * {
 *   "success": true,
 *   "data": {  updated user object  }
 * }
 * 
 * // Error Response
 * {
 *   "success": false,
 *   "error": "Error message"
 * }
 */
export async function linkWallet(req: Request): Promise<Response> {
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

	const sbUserClient = getClient(req)
	const { data: { user } } = await sbUserClient.auth.getUser()
	const uid = user?.id

	const { temporary_token } = body
	
	if (!temporary_token) {
		return new Response(JSON.stringify({ success: false, error: 'Missing temporary_token in request body' }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 400
		})
	}
	
	// Verify the temporary token and link the wallet to the user's account
	let siwtClaims
	try {
		const secret = Deno.env.get('JWT_SECRET')
		siwtClaims = verifyJWT(temporary_token, secret)
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: 'Invalid or expired temporary_token' }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 401
		})
	}
	
	// Initialize Supabase client with service role key for admin actions
	const serviceRoleSbClient = getServiceRoleClient()

	// Add wallet address to user's metadata
	const address = siwtClaims.wallet_address
	const { data, error } = await serviceRoleSbClient.auth.admin.updateUserById(uid!, {
		user_metadata: { wallet_address: address }
	})
	
	if (error) {
		console.error('Error linking wallet:', error)
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 500
		})
	}

	return new Response(JSON.stringify({ success: true, data }), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		status: 200
	})
}
