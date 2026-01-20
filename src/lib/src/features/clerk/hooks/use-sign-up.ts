import { SignUpResource } from '@clerk/types';
import { useState } from 'react';
import { AuthIdentifierVerifyBy, AuthResult, AuthIdentifierMethod } from '../types/shared';
import { StartSignUpParams, UseSignUpReturn } from '../types/sign-up';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-session-token';

export function useSignUp<TVerifyBy extends AuthIdentifierVerifyBy, TMethod extends AuthIdentifierMethod>(
  method: TMethod,
  verifyBy: TVerifyBy,
): UseSignUpReturn<TVerifyBy> {
  const { signUp, setActive } = useClerkResources();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState(false);

  const strategy = method === 'emailAddress' ? 'email_code' : 'phone_code';

  const startSignUp = async (params: StartSignUpParams<TVerifyBy>): Promise<AuthResult<SignUpResource>> => {
    setIsLoading(true);

    try {
      const { identifier, ...rest } = params as any;

      // 1. Create Sign Up Attempt
      let attempt;

      if (verifyBy === 'password') {
        const { password, ...restParams } = rest;
        attempt = await signUp?.create({
          [method]: identifier,
          password,
          ...restParams,
        });
      } else {
        // OTP Flow
        attempt = await signUp?.create({
          [method]: identifier,
          ...rest,
        });
      }

      // Prepare verification (send code)
      await signUp?.prepareVerification({ strategy: strategy });

      // 2. Handle Completion (Password flow)
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
