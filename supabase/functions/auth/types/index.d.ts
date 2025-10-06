/**
 * Type definitions for the TechMarkets Authentication Edge Function
 * 
 * These interfaces define the structure of requests and responses
 * for the SIWT (Sign In With Tezos) authentication system.
 */

/**
 * Request parameters for wallet authentication endpoint
 */
export interface SiwtRequestParams {
  /** Challenge message object from /auth/challenge endpoint */
  message: object;
  /** Public key of the Tezos wallet */
  pubkey: string;
  /** Cryptographic signature of the challenge message */
  signature: string;
  /** Tezos wallet address */
  address: string;
}

/**
 * Base response interface with common fields
 */
export interface ResponseData {
  /** Indicates if the operation was successful */
  success: boolean;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Response data for challenge generation endpoint
 * GET /auth/challenge/{address}
 */
export interface ChallengeResponseData extends ResponseData {
  /** EIP-4361 formatted message to be signed by the wallet */
  message: string;
  /** Random nonce for this authentication challenge */
  nonce: string;
}

/**
 * Response data for wallet authentication endpoint
 * POST /auth/wallet
 */
export interface AuthResponseData extends ResponseData {
  /** Whether the user already exists in the system */
  user_exists: boolean;
  /** Authentication data specific to user type */
  data: ExistingUserData | NewUserData;
}

/**
 * Authentication data for existing users
 * Returned when user already has an account in the system
 */
interface ExistingUserData {
  /** Type identifier for existing user flow */
  type: 'existing_user';
  /** Complete user information */
  user: {
    /** Unique user identifier */
    id: string;
    /** User's email address (optional) */
    email?: string;
    /** Tezos wallet address */
    wallet_address?: string;
    /** User profile information */
    profile: UserProfile;
  };
  /** Authentication session tokens */
  session: {
    /** JWT access token for API requests */
    access_token: string;
    /** Token used to refresh the access token */
    refresh_token: string;
    /** Unix timestamp when tokens expire */
    expires_at: number;
  };
  /** Available authentication methods for this user */
  auth_methods: string[]; // e.g., ['wallet', 'email', 'google']
}

/**
 * Authentication data for new users
 * Returned when user doesn't have an account yet
 */
interface NewUserData {
  /** Type identifier for new user flow */
  type: 'new_user';
  /** Tezos wallet address */
  wallet_address: string;
  /** Short-lived token for account creation flow */
  temporary_token: string;
  /** Unix timestamp when temporary token expires */
  expires_at: number;
}

/**
 * User profile information structure
 * Mirrors the public.profiles table schema from @20250916032755_profiles.sql
 */
interface UserProfile {
  /** User type: 'buyer', 'seller', or 'admin' */
  user_type?: string;
  /** Tezos wallet address (unique) */
  wallet_address?: string;
  /** Whether the user is Google verified */
  google_verified?: boolean;
  /** Whether the user is seller verified */
  seller_verified?: boolean;
  /** First name */
  firstname?: string;
  /** Last name */
  lastname?: string;
  /** Street address */
  address?: string;
  /** City */
  city?: string;
  /** State */
  state?: string;
  /** Country */
  country?: string;
  /** Zip/postal code */
  zipcode?: string;
  /** Instagram handle */
  instagram?: string;
  /** Twitter handle */
  twitter?: string;
  /** LinkedIn profile */
  linkedin?: string;
  /** Personal or business website */
  website?: string;
  /** LUNC wallet address */
  lunc_address?: string;
  /** XTZ (Tezos) wallet address */
  xtz_address?: string;
  /** what3words geolocation */
  what3words?: string;
  /** Google Plus Code geolocation */
  pluscode?: string;
  /** URL to user's profile image */
  profile_image_url?: string;
  /** Timestamp when profile was created (ISO string) */
  created_at?: string;
  /** Timestamp when profile was last updated (ISO string) */
  updated_at?: string;
}
