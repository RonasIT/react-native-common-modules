import { SignUpResource } from '@clerk/types';
import { useState } from 'react';
import { AuthIdentifierVerifyBy, AuthResult, AuthIdentifierMethod } from '../types/shared';
import { StartSignUpParams, UseSignUpReturn } from '../types/sign-up';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-session-token';

/**
 * Hook that provides functionality to handle user sign-up processes using an identifier such as an email or phone number.
 *
 * @template {AuthIdentifierVerifyBy} TVerifyBy - The verification method type
 * @template {AuthIdentifierMethod} TMethod - The identifier method type
 * @param {TMethod} method - Specifies the type of identifier used for authentication (e.g., 'emailAddress', 'phoneNumber')
 * @param {TVerifyBy} verifyBy - Specifies the verification method ('otp' for one-time passwords or 'password')
 *
 * @returns {UseSignUpReturn<TVerifyBy>} Object containing:
 * - `startSignUp` - Initiates a new user registration using the specified identifier and verification method.
 * - `isLoading` - Indicates whether the sign-up request is currently in progress.
 * - `signUp` - The Clerk SignUp resource object, which contains the current state of the sign-up attempt.
 */
export function useSignUp<TVerifyBy extends AuthIdentifierVerifyBy, TMethod extends AuthIdentifierMethod>(
  method: TMethod,
  verifyBy: TVerifyBy,
): UseSignUpReturn<TVerifyBy> {
  const { signUp, setActive } = useClerkResources();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState(false);

  const strategy = method === 'emailAddress' ? 'email_code' : 'phone_code';
  const identifierKey = method;

  const startSignUp = async (params: StartSignUpParams<TVerifyBy>): Promise<AuthResult<SignUpResource>> => {
    setIsLoading(true);

    try {
      const { identifier, ...rest } = params as any;

      // 1. Create Sign Up Attempt
      let attempt;

      if (verifyBy === 'password') {
        const { password, ...restParams } = rest;
        attempt = await signUp?.create({
          [identifierKey]: identifier,
          password,
          ...restParams,
        });
      } else {
        // OTP Flow
        attempt = await signUp?.create({
          [identifierKey]: identifier,
          ...rest,
        });
      }
      // Prepare verification (send code)
      await signUp?.prepareVerification({ strategy: strategy as any });

      // 2. Handle Completion (Password flow or if verification is skipped/optional)
      let sessionToken: string | undefined;

      if (attempt?.status === 'complete' && attempt.createdSessionId) {
        await setActive?.({ session: attempt.createdSessionId });
        const tokenResult = await getSessionToken({
          tokenTemplate: (params as any).tokenTemplate,
        });
        sessionToken = tokenResult.sessionToken || undefined;
      }

      return {
        isSuccess: true,
        resource: attempt,
        sessionToken,
      };
    } catch (error) {
      return { isSuccess: false, error, resource: signUp };
    } finally {
      setIsLoading(false);
    }
  };

  return { startSignUp, isLoading, signUp };
}
