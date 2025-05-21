import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { EmailCodeFactor, PhoneCodeFactor } from '@clerk/types';
import { useState } from 'react';
import { ClerkApiError } from '../enums';
import { OtpMethod, UseAuthWithOtpReturn } from '../types';
import { useClerkResources } from './use-clerk-resources';
import { useOtpVerification } from './use-otp-verification';

export function useAuthWithOtp({ method }: { method: OtpMethod }): UseAuthWithOtpReturn {
  const { signUp, signIn } = useClerkResources();
  const { sendOtpCode, verifyCode: verifyOtpCode, isVerifying } = useOtpVerification();
  const [isLoading, setIsLoading] = useState(false);
  const strategy = method === 'emailAddress' ? 'email_code' : 'phone_code';

  const startSignUp: UseAuthWithOtpReturn['startSignUp'] = async ({ identifier }) => {
    try {
      setIsLoading(true);
      await signUp?.create({ [method]: identifier });
      await sendOtpCode(strategy);

      return { isSuccess: true, signUp };
    } catch (error) {
      return { error, signUp, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const startSignIn: UseAuthWithOtpReturn['startSignIn'] = async ({ identifier }) => {
    try {
      setIsLoading(true);
      await signIn?.create({ identifier });
      await sendOtpCode(strategy);

      return { signIn, isSuccess: true };
    } catch (error) {
      return { signIn, error, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const startAuthorization: UseAuthWithOtpReturn['startAuthorization'] = async ({ identifier }) => {
    try {
      setIsLoading(true);
      await signUp?.create({ [method]: identifier });
      await sendOtpCode(strategy);

      return { signUp, signIn, isSuccess: true };
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        const error = e.errors[0];

        if (error?.code === ClerkApiError.FORM_IDENTIFIER_EXIST) {
          await signIn?.create({ identifier });
          await sendOtpCode(strategy);

          return { signIn, signUp, isSuccess: true };
        }
      }

      return { signIn, signUp, error: e, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode: UseAuthWithOtpReturn['verifyCode'] = async ({ code, tokenTemplate }) => {
    return verifyOtpCode({ code, strategy, tokenTemplate });
  };

  return {
    startSignIn,
    startSignUp,
    startAuthorization,
    sendOtpCode,
    verifyCode,
    isLoading,
    isVerifying,
  };
}
