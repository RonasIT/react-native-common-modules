import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { EmailCodeFactor, PhoneCodeFactor } from '@clerk/types';
import { useState } from 'react';
import { ClerkApiError } from '../enums';
import { OtpMethod, UseAuthWithOtpReturn } from '../types';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-token';

export function useAuthWithOtp({ method }: { method: OtpMethod }): UseAuthWithOtpReturn {
  const { signUp, signIn, setActive } = useClerkResources();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const strategy = method === 'emailAddress' ? 'email_code' : 'phone_code';

  const sendSignInOtpCode = async (): Promise<void> => {
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

  const sendSignUpOtpCode = async (): Promise<void> => {
    if (!signUp) return;
    await signUp.prepareVerification({ strategy });
  };

  const sendOtpCode: UseAuthWithOtpReturn['sendOtpCode'] = async () => {
    const isSignIn = !!signIn?.id;
    await (isSignIn ? sendSignInOtpCode() : sendSignUpOtpCode());
  };

  const startSignUp: UseAuthWithOtpReturn['startSignUp'] = async ({ identifier }) => {
    try {
      setIsLoading(true);
      await signUp?.create({ [method]: identifier });
      await signUp?.prepareVerification({ strategy });

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
      await sendOtpCode();

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
      await sendOtpCode();

      return { signUp, signIn, isSuccess: true };
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        const error = e.errors[0];

        if (error?.code === ClerkApiError.FORM_IDENTIFIER_EXIST) {
          await signIn?.create({ identifier });
          await sendOtpCode();

          return { signIn, signUp, isSuccess: true };
        }
      }

      return { signIn, signUp, error: e, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode: UseAuthWithOtpReturn['verifyCode'] = async ({ code, tokenTemplate }) => {
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

    return {
      signIn,
      signUp,
      isSuccess: false,
    };
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
