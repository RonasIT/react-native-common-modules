import { SignInCreateParams, SignInResource } from '@clerk/types';
import { AuthIdentifierVerifyBy, AuthResult, HookManagedFields, OtpAuthParams, PasswordAuthParams } from './shared';

/**
 * Params for Sign In.
 * Combines hook requirements (identifier/password) with native Clerk SignInCreateParams.
 */
export type StartSignInParams<VerifyBy extends AuthIdentifierVerifyBy> = VerifyBy extends 'otp'
  ? OtpAuthParams & Omit<SignInCreateParams, HookManagedFields>
  : PasswordAuthParams & Omit<SignInCreateParams, HookManagedFields>;

/**
 * Return type for the useSignIn hook
 */
export interface UseSignInReturn<VerifyBy extends AuthIdentifierVerifyBy> {
  /**
   * Initiates the sign-in flow using the provided parameters.
   *
   * Depending on the verification method:
   * - **Password**: Creates a sign-in attempt with the identifier and password.
   *   If successful, activates the session immediately.
   * - **OTP**: Creates a sign-in attempt with the identifier and initiates
   *   the verification flow (e.g., sends a one-time code).
   *
   * @param params - Parameters for authentication.
   * - For `password` strategy: requires `identifier` and `password`.
   * - For `otp` strategy: requires `identifier`.
   * - May include native Clerk `SignInCreateParams`
   *   (e.g. `redirectUrl`, `tokenTemplate`).
   *
   * @returns A promise that resolves to the authentication result.
   * - `isSuccess: true` if the attempt was created successfully.
   * - `sessionToken` is present when the flow completes immediately.
   * - `resource` contains the latest `SignInResource` state.
   */
  startSignIn(params: StartSignInParams<VerifyBy>): Promise<AuthResult<SignInResource>>;

  /** Indicates whether the sign-in operation is in progress */
  isLoading: boolean;

  /** The current Clerk SignIn resource, if available */
  signIn?: SignInResource;
}
