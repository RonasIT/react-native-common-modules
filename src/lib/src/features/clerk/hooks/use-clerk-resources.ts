import { getClerkInstance } from '@clerk/clerk-expo';
import { UseClerkResourcesReturn } from '../types';

/**
 * Hook that provides access to essential Clerk methods and objects.
 *
 * @returns {UseClerkResourcesReturn} Object containing Clerk resources:
 * - `signUp` - Provides access to SignUp object: https://clerk.com/docs/references/javascript/sign-up
 * - `signIn` - Provides access to SignIn object: https://clerk.com/docs/references/javascript/sign-in
 * - `setActive` - A function that sets the active session
 * - `signOut` - A function that signs out the current user
 */
export const useClerkResources = (): UseClerkResourcesReturn => {
  const clerk = getClerkInstance();
  const signUp = clerk.client?.signUp;
  const signIn = clerk.client?.signIn;
  const signOut = clerk.signOut;
  const setActive = clerk.setActive;

  return { signUp, signIn, setActive, signOut };
};
