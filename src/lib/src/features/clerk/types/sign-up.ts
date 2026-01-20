import { SignUpCreateParams, SignUpResource } from '@clerk/types';
import { AuthIdentifierVerifyBy, AuthResult, HookManagedFields, OtpAuthParams, PasswordAuthParams } from './shared';

/**
 * Params for Sign Up.
 * Combines hook requirements with native Clerk SignUpCreateParams (e.g. firstName, lastName).
 */
export type StartSignUpParams<VerifyBy extends AuthIdentifierVerifyBy> = VerifyBy extends 'otp'
  ? OtpAuthParams & Omit<SignUpCreateParams, HookManagedFields>
  : PasswordAuthParams & Omit<SignUpCreateParams, HookManagedFields>;

/** Return type for the useSignUp hook */
export interface UseSignUpReturn<VerifyBy extends AuthIdentifierVerifyBy> {
  startSignUp: (params: StartSignUpParams<VerifyBy>) => Promise<AuthResult<SignUpResource>>;
  isLoading: boolean;
  signUp?: SignUpResource;
}
