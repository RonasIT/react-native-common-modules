import { SignInResource } from '@clerk/types';
import { useState } from 'react';
import { AuthIdentifierVerifyBy, AuthResult, AuthIdentifierMethod } from '../types/shared';
import { StartSignInParams, UseSignInReturn } from '../types/sign-in';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-session-token';
import { useOtpVerification } from './use-otp-verification';

export function useSignIn<TVerifyBy extends AuthIdentifierVerifyBy, TMethod extends AuthIdentifierMethod>(
  method: TMethod,
  verifyBy: TVerifyBy,
): UseSignInReturn<TVerifyBy> {
  const { signIn, setActive } = useClerkResources();
  const { sendOtpCode } = useOtpVerification();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState(false);

  // Helper to strategy string (e.g., 'email_code')
  const strategy = method === 'emailAddress' ? 'email_code' : 'phone_code';

  const startSignIn = async (params: StartSignInParams<TVerifyBy>): Promise<AuthResult<SignInResource>> => {
    setIsLoading(true);

    try {
      const { identifier, ...rest } = params as any; // Cast to access dynamic props safely

      // 1. Create the Sign In Attempt
      let attempt;

      if (verifyBy === 'password') {
        const { password, ...restParams } = rest;
        attempt = await signIn?.create({
          identifier,
          password,
          ...restParams,
        });
      } else {
        // OTP Flow
        attempt = await signIn?.create({
          identifier,
          ...rest,
        });
      }

      // 2. Handle OTP Sending if required
      if (verifyBy === 'otp' && attempt?.status !== 'complete') {
        // Some strategies might require selecting the factor first
        await sendOtpCode(strategy);
      }

      // 3. Handle Completion (Password flow usually completes immediately)
      let sessionToken: string | undefined;

      if (attempt?.status === 'complete' && attempt.createdSessionId) {
        await setActive?.({ session: attempt.createdSessionId });
        const tokenResult = await getSessionToken({
          tokenTemplate: params.tokenTemplate,
        });
        sessionToken = tokenResult.sessionToken || undefined;
      }

      return {
        isSuccess: true,
        resource: attempt,
        sessionToken,
      };
    } catch (error) {
      return { isSuccess: false, error, resource: signIn };
    } finally {
      setIsLoading(false);
    }
  };

  return { startSignIn, isLoading, signIn };
}
