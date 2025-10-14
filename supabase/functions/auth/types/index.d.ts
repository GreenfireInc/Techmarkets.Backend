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
  data: ExistingUserData | NewSiwtUserData;
}

/**
 * Authentication data for existing users
 * Returned when user already has an account in the system
 */
interface ExistingUserData {
  /** Type identifier for existing user flow */
  type: 'existing_siwt_user';
  /** Complete user information */
  action_link: string;
}

/**
 * Authentication data for new users
 * Returned when user doesn't have an account yet
 */
interface NewSiwtUserData {
  /** Type identifier for new user flow */
  type: 'new_siwt_user';
  /** Short-lived token for account creation flow */
  temporary_token: string;
  /** Unix timestamp when temporary token expires */
  expires_at: number;
}
