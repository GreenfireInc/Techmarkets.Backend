import { getServiceRoleClient } from '../_shared/supabase.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verify as verifyJWT } from 'jsonwebtoken'

export async function linkWallet(req: Request) {
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

	const { uid, temporary_token } = body
	
	if (!temporary_token) {
		return new Response(JSON.stringify({ success: false, error: 'Missing temporary_token in request body' }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 400
		})
	}
	
	// Verify the temporary token and link the wallet to the user's account
	let claims
	try {
		const secret = Deno.env.get('JWT_SECRET')
		claims = verifyJWT(temporary_token, secret)
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: 'Invalid or expired temporary_token' }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 401
		})
	}
	
	// Initialize Supabase client with service role key for admin actions
	const supabase = getServiceRoleClient()

	// Add wallet address to user's metadata
	const address = claims.wallet_address
	const { data, error } = await supabase.auth.admin.updateUserById(uid, {
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
