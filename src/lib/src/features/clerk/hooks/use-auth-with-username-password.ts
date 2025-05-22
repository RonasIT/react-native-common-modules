import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { useState } from 'react';
import { ClerkApiError } from '../enums';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-token';
import { UseAuthWithPasswordReturn } from '../types';

export function useAuthWithUsernamePassword(): UseAuthWithPasswordReturn {
  const { signUp, signIn, setActive } = useClerkResources();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState(false);

  const startSignUp: UseAuthWithPasswordReturn['startSignUp'] = async ({
    identifier,
    password,
    tokenTemplate
  }) => {
    try {
      setIsLoading(true);
      const signUpAttempt = await signUp?.create({ username: identifier, password });

      if (signUpAttempt?.status === 'complete') {
        await setActive?.({ session: signUpAttempt.createdSessionId });
        const { sessionToken, error } = await getSessionToken({ tokenTemplate });

        if (sessionToken) {
          return {
            sessionToken,
            signUp,
            isSuccess: true
          };
        }

        return { signUp, error, isSuccess: false };
      }

      return { isSuccess: false, signUp };
    } catch (error) {
      return { error, signUp, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const startSignIn: UseAuthWithPasswordReturn['startSignIn'] = async ({
    identifier,
    password,
    tokenTemplate
  }) => {
    try {
      setIsLoading(true);
      const signInAttempt = await signIn?.create({ identifier, password });

      if (signInAttempt?.status === 'complete') {
        await setActive?.({ session: signInAttempt.createdSessionId });
        const { sessionToken, error } = await getSessionToken({ tokenTemplate });

        if (sessionToken) {
          return {
            sessionToken,
            signIn,
            isSuccess: true
          };
        }

        return { signIn, error, isSuccess: false };
      }

      return { signIn, isSuccess: false };
    } catch (error) {
      return { signIn, error, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const startAuthorization: UseAuthWithPasswordReturn['startAuthorization'] = async (args) => {
    const result = await startSignUp(args)

    if (result?.error && isClerkAPIResponseError(result?.error)) {
      const error = result?.error?.errors[0];

      if (error?.code === ClerkApiError.FORM_IDENTIFIER_EXIST) {
        return await startSignIn(args);
      }
    }

    return result
  };

  return {
    startSignIn,
    startSignUp,
    startAuthorization,
    isLoading,
  };
}
