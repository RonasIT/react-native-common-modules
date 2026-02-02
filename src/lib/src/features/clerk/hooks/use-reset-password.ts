import { EmailCodeFactor, PhoneCodeFactor } from '@clerk/types';
import { useState } from 'react';
import { OtpMethod, UseResetPasswordReturn } from '../types';
import { useClerkResources } from './use-clerk-resources';

/**
 * Hook that provides methods to handle password reset functionality through email or phone-based OTP.
 *
 * @param {Object} params - Parameters for the hook
 * @param {OtpMethod} params.method - The method to use for OTP (emailAddress or phoneNumber)
 *
 * @returns {UseResetPasswordReturn} Object containing:
 * - `startResetPassword` - A function to initiate the password reset process by sending a verification code to the user's email or phone number
 * - `resetPassword` - A function to reset the user's password and setting a new password
 * - `verifyCode` - A function to verify a code sent to the identifier, completing the verification process
 * - `isCodeSending` - A boolean indicating if the verification code is being sent
 * - `isResetting` - A boolean indicating if the password is being reset
 * - `isVerifying` - A boolean indicating whether a verification code is currently being processed
 */
export function useResetPassword({ method }: { method: OtpMethod }): UseResetPasswordReturn {
  const { signIn, setActive } = useClerkResources();

  const [isCodeSending, setIsCodeSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const strategy = method === 'emailAddress' ? 'reset_password_email_code' : 'reset_password_phone_code';

  const startResetPassword: UseResetPasswordReturn['startResetPassword'] = async ({ identifier }) => {
    setIsCodeSending(true);

    try {
      const attempt = await signIn?.create({
        identifier,
      });

      const factor = attempt?.supportedFirstFactors?.find((f) => f.strategy === strategy) as
        | EmailCodeFactor
        | PhoneCodeFactor
        | undefined;

      if (!factor) {
        throw new Error('Password reset unavailable for this method.');
      }

      const { emailAddressId, phoneNumberId } = factor as any;

      await signIn?.prepareFirstFactor({
        strategy,
        emailAddressId,
        phoneNumberId,
      });

      return { isSuccess: true, signIn };
    } catch (error) {
      return { isSuccess: false, signIn, error };
    } finally {
      setIsCodeSending(false);
    }
  };

  const verifyCode: UseResetPasswordReturn['verifyCode'] = async ({ code }) => {
    setIsVerifying(true);

    try {
      await signIn?.attemptFirstFactor({
        strategy,
        code,
      });

      return { isSuccess: true, signIn };
    } catch (error) {
      return { isSuccess: false, signIn, error };
    } finally {
      setIsVerifying(false);
    }
  };

  const resetPassword: UseResetPasswordReturn['resetPassword'] = async ({ password }) => {
    setIsResetting(true);

    try {
      const result = await signIn?.resetPassword({
        password,
      });

      if (result?.status === 'complete') {
        setActive({ session: result.createdSessionId });
      }

      return { isSuccess: true, signIn };
    } catch (error) {
      return { isSuccess: false, signIn, error };
    } finally {
      setIsResetting(false);
    }
  };

  return {
    startResetPassword,
    verifyCode,
    resetPassword,
    isCodeSending,
    isVerifying,
    isResetting,
  };
}
