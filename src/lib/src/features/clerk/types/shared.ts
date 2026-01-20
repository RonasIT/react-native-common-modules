import { ClerkAPIError } from '@clerk/types';

// --- Configuration Types ---

export type AuthIdentifierMethod = 'emailAddress' | 'phoneNumber' | 'username';
export type AuthIdentifierVerifyBy = 'otp' | 'password';

// --- Return Types ---

export type BaseSuccessReturn = { isSuccess: true; error?: never };
export type BaseFailureReturn = { isSuccess: false; error: ClerkAPIError | unknown };

export type WithSessionToken = { sessionToken?: string };

export type AuthResult<Resource> = (BaseSuccessReturn | BaseFailureReturn) & {
  resource?: Resource; // The SignIn or SignUp object
} & WithSessionToken;

// --- Param Helpers ---

export type HookManagedFields = 'identifier' | 'password' | 'emailAddress' | 'phoneNumber' | 'username';

/** Base parameters required for password-based auth */
export interface PasswordAuthParams {
  identifier: string;
  password: string;
  tokenTemplate?: string;
}

/** Base parameters required for OTP-based auth */
export interface OtpAuthParams {
  identifier: string;
  tokenTemplate?: string;
}
