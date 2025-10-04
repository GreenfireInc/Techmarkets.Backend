import { getClient } from '../_shared/supabase.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verify } from './@siwt/sdk/index.esm.js'
import { sign as signJWT } from 'jsonwebtoken'

export async function handleAuthenticateWallet(req: Request) {
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
  
  const nonce = challenge.nonce
  const authorizationHeader = req.headers.get('Authorization')!
  const supabase = getClient(authorizationHeader)
  
  // Validate nonce before proceeding with authentication
  const nonceValidation = await validateNonce(supabase, address, nonce)
  if (!nonceValidation.success) {
    return new Response(JSON.stringify(nonceValidation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
  
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

  // Check if user exists
  let profile = await getProfileByWalletAddress(supabase, address)
  if (!profile) {
    // Return newUserResponse
    const temporaryToken = await generateTemporaryToken(address)
    const newUserResponse = {
      success: true,
      user_exists: false,
      data: {
        type: 'new_user',
        wallet_address: address,
        temporary_token: temporaryToken,
        expires_at: Date.now() + 15 * 60 * 1000, // 15 minutes from now
      }
    }
    return new Response(JSON.stringify(newUserResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }

  // Return existingUserResponse
  // WIP
  // const { data: sessionData, error } = await supabase.auth.admin.generateLink({
  //   type: 'magiclink',
  //   email: profile.email,
  //   options: {
  //     redirectTo: `${Deno.env.get('FRONTEND_URL')}/dashboard`
  //   }
  // })
  // if (error) throw error

  // const existingUserResponse = {
  //   success: true,
  //   user_exists: true,
  //   data: {
  //     type: 'existing_user',
  //     user: {
  //       id: existingUser.data.id,
  //       email: existingUser.data.email,
  //       wallet_address: existingUser.data.wallet_address,
  //       profile: {
  //         username: existingUser.data.username,
  //         display_name: existingUser.data.display_name,
  //         avatar_url: existingUser.data.avatar_url,
  //         bio: existingUser.data.bio
  //       },
  //       created_at: existingUser.data.created_at,
  //       updated_at: existingUser.data.updated_at
  //     },
  //     session: {
  //       access_token: sessionData.properties.access_token,
  //       refresh_token: sessionData.properties.refresh_token,
  //       expires_at: sessionData.properties.expires_at,
  //       token_type: 'bearer'
  //     }
  //   }
  // }
}

async function validateNonce(supabase: any, address: string, providedNonce: string) {
  try {
    const { data: nonce, error } = await supabase
      .from('siwt_nonces')
      .select('*')
      .eq('address', address)
      .eq('nonce', providedNonce)
      .single()

    if (error || !nonce) {
      console.log('Nonce not found:', error)
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
      console.log('Nonce is expired')
      return {
        success: false,
        error: 'Nonce has expired'
      }
    }

    if (isUsed) {
      console.log('Nonce has already been used')
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


async function getProfileByWalletAddress(supabase: any, address: string) {
  const { data: existingProfile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('wallet_address', address)

  if (error) {
    console.error('Error getting profile by address:', error)
    throw error
  }

  return existingProfile[0]
}

async function generateTemporaryToken(address: string) {
  // Construct payload for JWT
  const payload = {
    wallet_address: address
  }
  
  const secret = Deno.env.get('JWT_SECRET')
  const options = {
    algorithm: 'HS256',
    expiresIn: 600, // 10 minutes (600 seconds)
    issuer: 'TechMarkets',
    subject: 'temp_signup_token'
  }

  const token = signJWT(payload, secret, options)
  return token
}
