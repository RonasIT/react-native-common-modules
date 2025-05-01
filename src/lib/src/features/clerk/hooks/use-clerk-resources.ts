import { getClerkInstance, useAuth } from '@clerk/clerk-expo';
import { UseClerkResourcesReturn } from '../types';

export const useClerkResources = (): UseClerkResourcesReturn => {
  const { signOut } = useAuth();
  const clerk = getClerkInstance();
  const signUp = clerk.client?.signUp;
  const signIn = clerk.client?.signIn;
  const setActive = clerk.setActive;

  return { signUp, signIn, setActive, signOut };
};
