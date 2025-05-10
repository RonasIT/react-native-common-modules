import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { useState } from 'react';
import { ClerkApiError } from '../enums';
import { UseAuthWithUsernamePasswordReturn } from '../types/types';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-token';

export function useAuthWithUsernamePassword(): UseAuthWithUsernamePasswordReturn {
  const { signUp, signIn, setActive } = useClerkResources();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState(false);

  const startSignUp: UseAuthWithUsernamePasswordReturn['startSignUp'] = async ({
    username,
    password,
    tokenTemplate
  }) => {
    try {
      setIsLoading(true);
      const signUpAttempt = await signUp?.create({ username, password });

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

  const startSignIn: UseAuthWithUsernamePasswordReturn['startSignIn'] = async ({
    username,
    password,
    tokenTemplate
  }) => {
    try {
      setIsLoading(true);
      const signInAttempt = await signIn?.create({ identifier: username, password });

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

  const startAuthorization: UseAuthWithUsernamePasswordReturn['startAuthorization'] = async (args) => {
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
    isLoading
  };
}
