import { useState } from 'react';
import { UseAuthWithTicketReturn } from '../types';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-session-token';

/**
 * Hook that facilitates user authentication using a ticket-based strategy (ticket is a token generated from the Backend API).
 * 
 * @returns {UseAuthWithTicketReturn} Object containing:
 * - `startAuthorization` - A function to initiate authentication with a ticket. It accepts an object with ticket and optional tokenTemplate parameters to kick off the authorization process and returns the session details
 * - `isLoading` - A boolean indicating whether the ticket-based authorization process is ongoing
 */
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
