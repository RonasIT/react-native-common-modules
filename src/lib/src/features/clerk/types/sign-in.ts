import { SignInCreateParams, SignInResource } from '@clerk/types';
import { AuthIdentifierVerifyBy, AuthResult, HookManagedFields, OtpAuthParams, PasswordAuthParams } from './shared';

/**
 * Params for Sign In.
 * Combines hook requirements (identifier/password) with native Clerk SignInCreateParams.
 */
export type StartSignInParams<VerifyBy extends AuthIdentifierVerifyBy> = VerifyBy extends 'otp'
  ? OtpAuthParams & Omit<SignInCreateParams, HookManagedFields>
  : PasswordAuthParams & Omit<SignInCreateParams, HookManagedFields>;

/** Return type for the useSignIn hook */
export interface UseSignInReturn<VerifyBy extends AuthIdentifierVerifyBy> {
  startSignIn: (params: StartSignInParams<VerifyBy>) => Promise<AuthResult<SignInResource>>;
  isLoading: boolean;
  signIn?: SignInResource;
}
