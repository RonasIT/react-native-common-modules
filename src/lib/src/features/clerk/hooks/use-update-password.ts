import { useUser } from '@clerk/clerk-expo';
import { useState } from 'react';
import { useUpdatePasswordReturn } from '../types';

export const useChangePassword = (): useUpdatePasswordReturn => {
  const { user } = useUser();
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  const updatePassword: useUpdatePasswordReturn['updatePassword'] = async (params) => {
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
