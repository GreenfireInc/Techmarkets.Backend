// Response types for /auth/wallet endpoint
export interface SiwtRequestParams {
  message: object;
  pubkey: string;
  signature: string;
  address: string;
}

export interface ResponseData {
  success: boolean;
  error?: string;
}

export interface ChallengeResponseData extends ResponseData {
  message: string;
  nonce: string;
}

export interface AuthResponseData extends ResponseData {
  user: any;
  user_exists: boolean;
  data: ExistingUserData | NewUserData;
}

// For existing users - provide access tokens and profile data
interface ExistingUserData {
  type: 'existing_user';
  user: {
    id: string;
    email?: string;
    wallet_address: string;
    profile: UserProfile;
    created_at: string;
    updated_at: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    token_type: 'bearer';
  };
  auth_methods: string[]; // ['wallet', 'email', 'google'] etc.
}

// For new users - provide temporary token for account linking
interface NewUserData {
  type: 'new_user';
  wallet_address: string;
  temporary_token: string; // Short-lived token for account creation flow
  expires_at: number; // Token expiration (e.g., 15 minutes)
  next_steps: {
    required_action: 'complete_signup';
    available_methods: AuthMethod[];
    signup_url: string; // Frontend route to complete signup
  };
}

interface AuthMethod {
  type: 'email' | 'google' | 'github' | 'discord';
  display_name: string;
  enabled: boolean;
}

interface UserProfile {
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  // Add other profile fields as needed
}
