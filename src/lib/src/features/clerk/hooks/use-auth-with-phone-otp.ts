import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { PhoneCodeFactor } from '@clerk/types';
import { useState } from 'react';
import { OtpError } from '../enums';
import { UseAuthWithPhoneOtpReturn } from '../types';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-token';

export function useAuthWithPhoneOtp(): UseAuthWithPhoneOtpReturn {
  const { signUp, signIn, setActive } = useClerkResources();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const sendSignInOtpCode = async (): Promise<void> => {
    const phoneCodeFactor = signIn?.supportedFirstFactors?.find(
      (factor): factor is PhoneCodeFactor => factor.strategy === 'phone_code',
    );

    if (phoneCodeFactor?.phoneNumberId) {
      await signIn?.prepareFirstFactor({
        strategy: 'phone_code',
        phoneNumberId: phoneCodeFactor.phoneNumberId
      });
    }
  };

  const sendSignUpOtpCode = async (): Promise<void> => {
    if (!signUp) return;
    await signUp.preparePhoneNumberVerification();
  };

  const sendOtpCode: UseAuthWithPhoneOtpReturn['sendOtpCode'] = async () => {
    const isSignIn = !!signIn?.id;
    await (isSignIn ? sendSignInOtpCode() : sendSignUpOtpCode());
  };

  const startSignUp: UseAuthWithPhoneOtpReturn['startSignUp'] = async ({ phone }) => {
    try {
      setIsLoading(true);
      await signUp?.create({ phoneNumber: phone });
      await signUp?.preparePhoneNumberVerification();

      return { isSuccess: true, signUp };
    } catch (error) {
      return { error, signUp, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const startSignIn: UseAuthWithPhoneOtpReturn['startSignIn'] = async ({ phone }) => {
    try {
      setIsLoading(true);
      await signIn?.create({ identifier: phone });
      await sendOtpCode();

      return { signIn, isSuccess: true };
    } catch (error) {
      return { signIn, error, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const startAuthorization: UseAuthWithPhoneOtpReturn['startAuthorization'] = async ({ phone }) => {
    try {
      setIsLoading(true);
      await signUp?.create({ phoneNumber: phone });
      await sendOtpCode();

      return { signUp, signIn, isSuccess: true };
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        const error = e.errors[0];

        if (error?.code === OtpError.FORM_IDENTIFIER_EXIST) {
          await signIn?.create({ identifier: phone });
          await sendOtpCode();

          return { signIn, signUp, isSuccess: true };
        }
      }

      return { signIn, signUp, error: e, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode: UseAuthWithPhoneOtpReturn['verifyCode'] = async ({ code, tokenTemplate }) => {
    try {
      setIsVerifying(true);
      const isSignIn = !!signIn?.id;

      if (isSignIn) {
        const completeSignIn = await signIn.attemptFirstFactor({
          strategy: 'phone_code',
          code
        });

        if (completeSignIn?.status === 'complete') {
          await setActive?.({ session: completeSignIn.createdSessionId });
          const sessionToken = (await getSessionToken({ tokenTemplate })).sessionToken;

          if (sessionToken) {
            return {
              sessionToken,
              signIn,
              signUp,
              isSuccess: true
            };
          }

          return {
            sessionToken: null,
            signIn,
            signUp,
            isSuccess: false
          };
        }
      } else {
        const completeSignUp = await signUp?.attemptPhoneNumberVerification({
          code
        });

        if (completeSignUp?.status === 'complete') {
          await setActive?.({ session: completeSignUp.createdSessionId });
          const { sessionToken, error } = await getSessionToken({ tokenTemplate });

          if (sessionToken) {
            return {
              sessionToken,
              signIn,
              signUp,
              isSuccess: true
            };
          }

          return {
            signIn,
            signUp,
            error,
            isSuccess: false
          };
        }
      }
    } catch (error) {
      return {
        signIn,
        signUp,
        error,
        isSuccess: false
      };
    } finally {
      setIsVerifying(false);
    }

    return {
      signIn,
      signUp,
      isSuccess: false
    };
  };

  return {
    startSignIn,
    startSignUp,
    startAuthorization,
    sendOtpCode,
    verifyCode,
    isLoading,
    isVerifying
  };
}
