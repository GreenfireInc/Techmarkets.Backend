# TechMarkets Authentication Edge Function

This Supabase Edge Function provides secure wallet-based authentication for the TechMarkets platform using SIWT (Sign In With Tezos). It implements a robust authentication flow that follows cryptographic best practices and prevents common attack vectors.

## Overview

The authentication system allows users to sign in using their Tezos wallet by signing a cryptographic challenge. This provides a secure, passwordless authentication method that leverages blockchain technology for identity verification.

## Authentication Flow

### 1. Challenge Generation
- **Endpoint**: `GET /auth/challenge/{wallet_address}`
- **Purpose**: Generate a cryptographic challenge for the wallet to sign
- **Process**:
  1. Extract wallet address from URL
  2. Generate cryptographically secure random nonce
  3. Store nonce in database with 10-minute expiration
  4. Create EIP-4361 compliant message payload
  5. Return challenge message and nonce

### 2. Authentication
- **Endpoint**: `POST /auth/wallet`
- **Purpose**: Verify signed challenge and authenticate user
- **Process**:
  1. Validate request body and extract authentication data
  2. Verify nonce hasn't been used and isn't expired
  3. Verify cryptographic signature using SIWT SDK
  4. Check if user exists in database
  5. Return appropriate response (new user temp token or existing user session)

## API Endpoints

### GET /auth/challenge/{address}
Generates an authentication challenge for the specified wallet address.

**Request**:
```
GET /auth/challenge/tz1abc123...
```

**Response**:
```json
{
  "success": true,
  "message": "TechMarkets wants you to sign in with your Tezos account:\ntz1abc123...\n\nSign in to TechMarkets with your Tezos wallet\n\nURI: https://techmarkets.io\nVersion: 1\nChain ID: NetXdQprcVkpaWU\nNonce: abc123...\nIssued At: 2024-01-01T00:00:00.000Z\nExpiration Time: 2024-01-01T00:10:00.000Z",
  "nonce": "abc123..."
}
```

### POST /auth/wallet
Verifies the signed challenge and authenticates the user.

**Request**:
```json
{
  "address": "tz1abc123...",
  "challenge": {
    "message": {
      "payload": "TechMarkets wants you to sign..."
    },
    "nonce": "abc123..."
  },
  "pubkey": "edpk...",
  "signature": "edsig..."
}
```

**Response (New User)**:
```json
{
  "success": true,
  "user_exists": false,
  "data": {
    "type": "new_siwt_user",
    "temporary_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": 1704067200000
  }
}
```

**Response (Existing User)**:
```json
{
  "success": true,
  "user_exists": true,
  "data": {
    "type": "existing_user",
    "user": {
      "id": "uuid",
      "wallet_address": "tz1abc123...",
      "profile": {
        // UserProfile
      }
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_at": 1704070800,
      "token_type": "bearer"
    }
  }
}
```

### POST /auth/link-wallet
Links a wallet address to an existing user account. This endpoint requires a valid temporary token obtained during the wallet authentication flow.

**Request**:
```json
{
  "uid": "user-uuid-here",
  "temporary_token": "jwt.token.here"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "user-uuid-here",
    "user_metadata": {
      "wallet_address": "tz1newaddress..."
    }
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

**Possible Error Codes**:
- `400 Bad Request`: Invalid request body or missing required fields
- `401 Unauthorized`: Invalid or expired temporary token
- `500 Internal Server Error`: Server error during wallet linking

## Security Features

### Nonce-Based Challenge System
- Each challenge includes a cryptographically secure random nonce
- Nonces are stored in the database with expiration times
- Once used, nonces are marked as consumed to prevent replay attacks
- 10-minute expiration window prevents stale challenges

### Cryptographic Signature Verification
- Uses the SIWT SDK for signature verification
- Verifies that the message was actually signed by the wallet owner
- Validates domain and nonce to prevent cross-site attacks
- Supports Tezos mainnet (NetXdQprcVkpaWU)

### Temporary Token System
- New users receive temporary JWT tokens for account creation
- Tokens expire after 10 minutes to limit exposure
- Tokens contain wallet address for verification
- Allows secure onboarding flow for new users

### CORS Protection
- Proper CORS headers for cross-origin requests
- Configurable allowed origins and headers
- Preflight request handling

## Environment Variables

The following environment variables must be configured:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access
- `JWT_SECRET`: Secret key for signing temporary tokens
- `PUBLIC_SITE_URL`: Public URL of the application (fallback for client URL)

## Error Handling

The function includes comprehensive error handling for:

- Invalid JSON requests
- Missing or invalid wallet addresses
- Expired or used nonces
- Invalid signatures
- Database connection errors
- Missing environment variables

All errors return structured JSON responses with appropriate HTTP status codes.

## Security Considerations

- Always use HTTPS in production
- Regularly rotate JWT secrets
- Monitor for suspicious authentication patterns
- Implement rate limiting for challenge generation
- Consider implementing CAPTCHA for additional protection
- Regular security audits of the authentication flow
