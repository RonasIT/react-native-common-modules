import { useSSO } from '@clerk/clerk-expo';
import { useState } from 'react';
import { StartSSOArgs, UseAuthWithSSOReturn } from '../types';
import { useGetSessionToken } from './use-get-token';

export function useAuthWithSSO(): UseAuthWithSSOReturn {
  const { startSSOFlow: clerkStartSSOFlow } = useSSO();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const startSSOFlow: UseAuthWithSSOReturn['startSSOFlow'] = async ({
    strategy,
    redirectUrl,
    tokenTemplate
  }: StartSSOArgs) => {
    try {
      setIsLoading(true);

      const { createdSessionId, setActive, signIn, signUp } = await clerkStartSSOFlow({
        strategy,
        redirectUrl
      });

      if (!createdSessionId) {
        return { sessionToken: null };
      }

      await setActive?.({ session: createdSessionId });
      const { sessionToken } = await getSessionToken({ tokenTemplate });

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
    } catch (error) {
      return {
        error,
        isSuccess: false
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { startSSOFlow, isLoading };
}
