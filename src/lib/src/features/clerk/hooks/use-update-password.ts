import { useUser } from '@clerk/clerk-expo';
import { useState } from 'react';
import { UseUpdatePasswordReturn } from '../types';

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
