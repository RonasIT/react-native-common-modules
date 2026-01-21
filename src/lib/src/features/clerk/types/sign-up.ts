import { SignUpCreateParams, SignUpResource } from '@clerk/types';
import { AuthIdentifierVerifyBy, AuthResult, HookManagedFields, OtpAuthParams, PasswordAuthParams } from './shared';

/**
 * Params for Sign Up.
 * Combines hook requirements with native Clerk SignUpCreateParams
 * (e.g. `firstName`, `lastName`, `unsafeMetadata`).
 */
export type StartSignUpParams<VerifyBy extends AuthIdentifierVerifyBy> = VerifyBy extends 'otp'
  ? OtpAuthParams & Omit<SignUpCreateParams, HookManagedFields>
  : PasswordAuthParams & Omit<SignUpCreateParams, HookManagedFields>;

/**
 * Return type for the useSignUp hook
 */
export interface UseSignUpReturn<VerifyBy extends AuthIdentifierVerifyBy> {
  /**
   * Initiates the sign-up flow using the provided parameters.
   *
   * Depending on the verification method:
   * - **Password**: Creates a sign-up attempt with the identifier and password.
   *   If no additional verification is required, the session may be activated immediately.
   * - **OTP**: Creates a sign-up attempt with the identifier and automatically
   *   triggers the verification step (e.g. sends a one-time code).
   *
   * @param params - Parameters for registration.
   * - For `password` strategy: requires `identifier` and `password`.
   * - For `otp` strategy: requires `identifier`.
   * - May include native Clerk `SignUpCreateParams`
   *   (e.g. `firstName`, `lastName`, `unsafeMetadata`).
   * - May include a `tokenTemplate` to customize the returned session token.
   *
   * @returns A promise that resolves to the registration result.
   * - `isSuccess: true` if the sign-up attempt was created successfully.
   * - `sessionToken` is present when the flow completes immediately.
   * - `resource` contains the latest `SignUpResource` state
   *   (e.g. `missing_requirements`, `unverified`).
   */
  startSignUp(params: StartSignUpParams<VerifyBy>): Promise<AuthResult<SignUpResource>>;

  /** Indicates whether the sign-up operation is in progress */
  isLoading: boolean;

  /** The current Clerk SignUp resource, if available */
  signUp?: SignUpResource;
}
