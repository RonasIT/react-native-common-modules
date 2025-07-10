import { getClerkInstance } from '@clerk/clerk-expo';
import { UseGetSessionTokenReturn } from '../types';

/**
 * Hook that provides functionality for getting session tokens.
 * 
 * @returns {UseGetSessionTokenReturn} Object containing:
 * - `getSessionToken` - A function to retrieve the session token. It takes an optional tokenTemplate parameter to specify a template for the token
 */
export const useGetSessionToken = (): UseGetSessionTokenReturn => {
  const clerk = getClerkInstance();

  const getSessionToken: UseGetSessionTokenReturn['getSessionToken'] = async ({ tokenTemplate }) => {
    try {
      const token = await clerk.session?.getToken({ template: tokenTemplate });
      const sessionToken = token || clerk.session?.lastActiveToken?.getRawString();

      if (sessionToken) {
        return {
          sessionToken,
          isSuccess: true
        };
      } else {
        return {
          sessionToken: null,
          isSuccess: false
        };
      }
    } catch (error) {
      return {
        sessionToken: null,
        error,
        isSuccess: false
      };
    }
  };

  return { getSessionToken };
};
