# Supabase Functions CORS Setup

This directory contains Supabase Edge Functions with proper CORS support for browser-based applications.

## CORS Configuration

All functions use a shared CORS configuration located in `_shared/cors.ts`:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

## Function Structure

### 1. SIWT Authentication (`siwt-auth/`)
- Handles Sign-In with Tezos (SIWT) authentication
- Uses Hono framework with manual CORS handling
- Includes proper error handling with CORS headers

### 2. Wallet Beacon Authentication (`wallet-beacon-auth.ts`)
- Handles Tezos wallet authentication via Beacon
- Uses Hono framework with manual CORS handling
- Includes proper error handling with CORS headers

### 3. Example CORS Function (`example-cors/`)
- Demonstrates the recommended CORS setup from Supabase documentation
- Uses Deno.serve with manual CORS handling
- Serves as a template for future functions

## CORS Implementation

### For Hono-based functions:
```typescript
import { corsHeaders } from '../_shared/cors.ts'

// Handle CORS preflight requests
app.options('*', (c) => {
  return c.text('', 200, corsHeaders)
})

// Include CORS headers in all responses
return c.json(data, status, corsHeaders)
```

### For Deno.serve functions:
```typescript
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Include CORS headers in responses
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
})
```

## Deployment

Deploy functions using the Supabase CLI:

```bash
supabase functions deploy <function-name>
```

## Testing CORS

Test CORS support by making requests from a browser:

```javascript
// Test preflight request
fetch('https://your-project.supabase.co/functions/v1/function-name', {
  method: 'OPTIONS',
  headers: {
    'Content-Type': 'application/json',
  }
})

// Test actual request
fetch('https://your-project.supabase.co/functions/v1/function-name', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'Test' })
})
```

## Security Notes

- The current CORS configuration allows all origins (`*`)
- For production, consider restricting origins to your specific domains
- All functions include proper error handling and validation 