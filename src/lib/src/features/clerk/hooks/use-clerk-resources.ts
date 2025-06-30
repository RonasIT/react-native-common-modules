import { getClerkInstance } from '@clerk/clerk-expo';
import { UseClerkResourcesReturn } from '../types';

export const useClerkResources = (): UseClerkResourcesReturn => {
  const clerk = getClerkInstance();
  const signUp = clerk.client?.signUp;
  const signIn = clerk.client?.signIn;
  const signOut = clerk.signOut;
  const setActive = clerk.setActive;

  return { signUp, signIn, setActive, signOut };
};
