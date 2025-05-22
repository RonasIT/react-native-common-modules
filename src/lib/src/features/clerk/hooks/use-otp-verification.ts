import { EmailCodeFactor, PhoneCodeFactor } from '@clerk/types';
import { useState } from 'react';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-token';
import { OtpStrategy, UseOtpVerificationReturn } from '../types/types';

export function useOtpVerification() {
  const { signUp, signIn, setActive } = useClerkResources();
  const { getSessionToken } = useGetSessionToken();
  const [isVerifying, setIsVerifying] = useState(false);

  const sendSignInOtpCode = async (strategy: OtpStrategy): Promise<void> => {
    const codeFactor = signIn?.supportedFirstFactors?.find(
      (factor): factor is EmailCodeFactor | PhoneCodeFactor => factor.strategy === strategy,
    );

    if (codeFactor && 'emailAddressId' in codeFactor) {
      await signIn?.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: codeFactor.emailAddressId,
      });
    } else if (codeFactor && 'phoneNumberId' in codeFactor) {
      await signIn?.prepareFirstFactor({
        strategy: 'phone_code',
        phoneNumberId: codeFactor.phoneNumberId,
      });
    } else {
      throw new Error('No code factor found for strategy: ' + strategy);
    }
  };

  const sendSignUpOtpCode = async (strategy: OtpStrategy): Promise<void> => {
    if (!signUp) return;
    await signUp.prepareVerification({ strategy });
  };

  const sendOtpCode: UseOtpVerificationReturn['sendOtpCode'] = async (strategy) => {
    const isSignIn = !!signIn?.id;

    if (isSignIn) {
      await sendSignInOtpCode(strategy);
    } else {
      await sendSignUpOtpCode(strategy);
    }
  };

  const verifyCode: UseOtpVerificationReturn['verifyCode'] = async ({ code, strategy, tokenTemplate }) => {
    try {
      setIsVerifying(true);
      const isSignIn = !!signIn?.id;

      if (isSignIn) {
        const completeSignIn = await signIn.attemptFirstFactor({
          strategy,
          code,
        });

        if (completeSignIn?.status === 'complete') {
          await setActive?.({ session: completeSignIn.createdSessionId });
          const sessionToken = (await getSessionToken({ tokenTemplate })).sessionToken;

          if (sessionToken) {
            return {
              sessionToken,
              signIn,
              signUp,
              isSuccess: true,
            };
          }

          return {
            sessionToken: null,
            signIn,
            signUp,
            isSuccess: false,
          };
        }
      } else {
        const completeSignUp = await signUp?.attemptVerification({
          strategy,
          code,
        });

        if (completeSignUp?.status === 'complete') {
          await setActive?.({ session: completeSignUp.createdSessionId });
          const { sessionToken, error } = await getSessionToken({ tokenTemplate });

          if (sessionToken) {
            return {
              sessionToken,
              signIn,
              signUp,
              isSuccess: true,
            };
          }

          return {
            signIn,
            signUp,
            error,
            isSuccess: false,
          };
        }
      }

      return {
        signIn,
        signUp,
        isSuccess: false
      };
    } catch (error) {
      return {
        signIn,
        signUp,
        error,
        isSuccess: false,
      };
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    sendOtpCode,
    verifyCode,
    isVerifying,
  };
}