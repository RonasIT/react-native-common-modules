import { useState } from 'react';
import { OtpMethod, UseResetPasswordReturn } from '../types';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-session-token';

/**
 * Hook that provides methods to handle password reset functionality through email or phone-based OTP.
 * 
 * @param {Object} params - Parameters for the hook
 * @param {OtpMethod} params.method - The method to use for OTP (emailAddress or phoneNumber)
 * 
 * @returns {UseResetPasswordReturn} Object containing:
 * - `startResetPassword` - A function to initiate the password reset process by sending a verification code to the user's email or phone number
 * - `resetPassword` - A function to reset the user's password by verifying the code and setting a new password
 * - `isCodeSending` - A boolean indicating if the verification code is being sent
 * - `isResetting` - A boolean indicating if the password is being reset
 */
export function useResetPassword({ method }: { method: OtpMethod }): UseResetPasswordReturn {
  const strategy = method === 'emailAddress' ? 'reset_password_email_code' : 'reset_password_phone_code';
  const { signIn, setActive } = useClerkResources();
  const { getSessionToken } = useGetSessionToken();
  const [isCodeSending, setIsCodeSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const startResetPassword: UseResetPasswordReturn['startResetPassword'] = async ({ identifier }) => {
    setIsCodeSending(true);

    try {
      await signIn?.create({
        strategy,
        identifier,
      });

      return { isSuccess: true, signIn };
    } catch (error) {
      return { isSuccess: false, signIn, error };
    } finally {
      setIsCodeSending(false);
    }
  };

  const resetPassword: UseResetPasswordReturn['resetPassword'] = async ({ code, password, tokenTemplate }) => {
    setIsResetting(true);

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy,
        code,
        password,
      });

      if (result?.status === 'complete') {
        setActive({ session: result.createdSessionId });
        const { sessionToken } = await getSessionToken({ tokenTemplate });

        if (sessionToken) {
          return { isSuccess: true, signIn, sessionToken };
        }
      }
    } catch (error) {
      return { isSuccess: false, signIn, error };
    } finally {
      setIsResetting(false);
    }

    return { isSuccess: false, signIn };
  };

  return { startResetPassword, resetPassword, isCodeSending, isResetting };
}
