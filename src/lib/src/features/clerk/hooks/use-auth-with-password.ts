import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { useState } from 'react';
import { ClerkApiError } from '../enums';
import { AuthPasswordMethod, UseAuthWithPasswordOtpReturn } from '../types';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-token';

export function useAuthWithPassword({ method }: { method: AuthPasswordMethod }): UseAuthWithPasswordOtpReturn {
  const { signUp, signIn, setActive } = useClerkResources();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const sendOtpCode: UseAuthWithPasswordOtpReturn['sendOtpCode'] = async () => {
    await (method === 'emailAddress' ?
      signUp?.prepareEmailAddressVerification()
      : signUp?.preparePhoneNumberVerification()
    );
  };

  const startSignUp: UseAuthWithPasswordOtpReturn['startSignUp'] = async ({ identifier, password }) => {
    try {
      setIsLoading(true);
      await signUp?.create({ [method]: identifier, password });
      await sendOtpCode();

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
      await sendOtpCode();

      return { signUp, signIn, isSuccess: true, isSignedIn: false };
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        const error = e.errors[0];

        if (error?.code === ClerkApiError.FORM_IDENTIFIER_EXIST) {
          await startSignIn({ identifier, password, tokenTemplate });

          return { signIn, signUp, isSuccess: true };
        }
      }

      return { signIn, signUp, error: e, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode: UseAuthWithPasswordOtpReturn['verifyCode'] = async ({ code, tokenTemplate }) => {
    try {
      setIsVerifying(true);

      const completeSignUp = method === 'emailAddress' ?
        await signUp?.attemptEmailAddressVerification({ code })
        : await signUp?.attemptPhoneNumberVerification({ code });

      if (completeSignUp?.status === 'complete') {
        await setActive?.({ session: completeSignUp.createdSessionId });
        const { sessionToken, error } = await getSessionToken({ tokenTemplate });

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
          error,
          isSuccess: false
        };
      }

      return {
        signIn,
        signUp,
        isSuccess: false
      };
    } catch (error) {
      return {
        signIn,
        signUp,
        error,
        isSuccess: false
      };
    } finally {
      setIsVerifying(false);
    }
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
