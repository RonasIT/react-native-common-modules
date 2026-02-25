import { useUser } from '@clerk/clerk-expo';
import { useState } from 'react';
import { UseUpdatePasswordReturn } from '../types';

/**
 * Hook that provides functionality to update the current user's password.
 *
 * Requires the user to supply both the current password (for verification) and
 * the new password. On success, the user's password is updated in Clerk; on
 * failure, the hook returns an error without throwing.
 *
 * @returns {UseUpdatePasswordReturn} Object containing:
 * - `updatePassword` — Updates the user's password using current and new password
 * - `isPasswordUpdating` — Indicates whether a password update is currently in progress
 */
export const useChangePassword = (): UseUpdatePasswordReturn => {
  const { user } = useUser();
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  const updatePassword: UseUpdatePasswordReturn['updatePassword'] = async (params) => {
    const { newPassword, currentPassword } = params;

    try {
      setIsPasswordUpdating(true);

      await user?.updatePassword({ newPassword, currentPassword });

      return { isSuccess: true };
    } catch (error) {
      return { isSuccess: false, error };
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  return { updatePassword, isPasswordUpdating };
};
