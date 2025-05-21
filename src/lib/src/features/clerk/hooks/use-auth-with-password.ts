import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { useState } from 'react';
import { ClerkApiError } from '../enums';
import { AuthPasswordMethod, UseAuthWithPasswordOtpReturn } from '../types';
import { useClerkResources } from './use-clerk-resources';
import { useOtpVerification } from './use-otp-verification';
import { useGetSessionToken } from './use-get-token';

export function useAuthWithPassword({ method }: { method: AuthPasswordMethod }): UseAuthWithPasswordOtpReturn {
  const { signUp, signIn, setActive } = useClerkResources();
  const { sendOtpCode, verifyCode: verifyOtpCode, isVerifying } = useOtpVerification();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState(false);
  const strategy = method === 'emailAddress' ? 'email_code' : 'phone_code';

  const startSignUp: UseAuthWithPasswordOtpReturn['startSignUp'] = async ({ identifier, password }) => {
    try {
      setIsLoading(true);
      await signUp?.create({ [method]: identifier, password });
      await sendOtpCode(strategy);

      return { isSuccess: true, signUp };
    } catch (error) {
      return { error, signUp, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const startSignIn: UseAuthWithPasswordOtpReturn['startSignIn'] = async ({ identifier, password, tokenTemplate }) => {
    try {
      setIsLoading(true);
      const completeSignIn = await signIn?.create({
        identifier,
        password
      });

      if (completeSignIn?.status === 'complete') {
        await setActive?.({ session: completeSignIn.createdSessionId });
        const sessionToken = (await getSessionToken({ tokenTemplate })).sessionToken;

        if (sessionToken) {
          return {
            sessionToken,
            signIn,
            signUp,
            isSuccess: true
          };
        }

        return {
          signIn,
          signUp,
          isSuccess: false
        };
      }

      return { signIn, isSuccess: false };
    } catch (error) {
      return { signIn, error, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const startAuthorization: UseAuthWithPasswordOtpReturn['startAuthorization'] = async ({
    identifier,
    password,
    tokenTemplate
  }) => {
    try {
      setIsLoading(true);
      await signUp?.create({ [method]: identifier, password });
      await sendOtpCode(strategy);

      return { signUp, signIn, isSuccess: true, isSignedIn: false };
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        const e = error.errors[0];

        if (e?.code === ClerkApiError.FORM_IDENTIFIER_EXIST) {
          const result = await startSignIn({ identifier, password, tokenTemplate });

          return result;
        }
      }

      return { signIn, signUp, error, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode: UseAuthWithPasswordOtpReturn['verifyCode'] = async ({ code, tokenTemplate }) => {
    return verifyOtpCode({ code, strategy, tokenTemplate });
  };

  return {
    startSignIn,
    startSignUp,
    startAuthorization,
    sendOtpCode,
    verifyCode,
    isLoading,
    isVerifying,
  };
}
