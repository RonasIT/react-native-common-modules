import { useState } from 'react';
import { UseAuthWithTicketReturn } from '../types';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-token';

export function useAuthWithTicket(): UseAuthWithTicketReturn {
  const { signIn, setActive } = useClerkResources();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState(false);

  const startAuthorization: UseAuthWithTicketReturn['startAuthorization'] = async ({ ticket, tokenTemplate }) => {
    if (signIn) {
      setIsLoading(true);

      try {
        const signInAttempt = await signIn.create({
          strategy: 'ticket',
          ticket
        });

        if (signInAttempt.status === 'complete') {
          await setActive({
            session: signInAttempt.createdSessionId
          });
          const { sessionToken, error } = await getSessionToken({ tokenTemplate });

          if (sessionToken) {
            return {
              sessionToken,
              signIn,
              isSuccess: true
            };
          }

          return {
            signIn,
            error,
            isSuccess: false
          };
        }
      } catch (error) {
        return {
          signIn,
          error,
          isSuccess: false
        };
      } finally {
        setIsLoading(false);
      }
    }

    return {
      sessionToken: null,
      signIn,
      isSuccess: false
    };
  };

  return {
    startAuthorization,
    isLoading
  };
}
