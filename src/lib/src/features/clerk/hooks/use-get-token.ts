import { getClerkInstance } from '@clerk/clerk-expo';
import { UseGetSessionTokenReturn } from '../types';

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
