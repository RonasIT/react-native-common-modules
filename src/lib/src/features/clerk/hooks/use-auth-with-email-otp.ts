import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { EmailCodeFactor } from '@clerk/types';
import { useState } from 'react';
import { OtpError } from '../enums';
import { UseAuthWithEmailOtpReturn } from '../types';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-token';

export function useAuthWithEmailOtp(): UseAuthWithEmailOtpReturn {
  const { signUp, signIn, setActive } = useClerkResources();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const sendSignInOtpCode = async (): Promise<void> => {
    const emailCodeFactor = signIn?.supportedFirstFactors?.find(
      (factor): factor is EmailCodeFactor => factor.strategy === 'email_code',
    );

    if (emailCodeFactor?.emailAddressId) {
      await signIn?.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: emailCodeFactor.emailAddressId
      });
    }
  };

  const sendSignUpOtpCode = async (): Promise<void> => {
    if (!signUp) return;
    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
  };

  const sendOtpCode: UseAuthWithEmailOtpReturn['sendOtpCode'] = async () => {
    const isSignIn = !!signIn?.id;
    await (isSignIn ? sendSignInOtpCode() : sendSignUpOtpCode());
  };

  const startSignUp: UseAuthWithEmailOtpReturn['startSignUp'] = async ({ email }) => {
    try {
      setIsLoading(true);
      await signUp?.create({ emailAddress: email });
      await signUp?.prepareEmailAddressVerification({ strategy: 'email_code' });

      return { isSuccess: true, signUp };
    } catch (error) {
      return { error, signUp, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const startSignIn: UseAuthWithEmailOtpReturn['startSignIn'] = async ({ email }) => {
    try {
      setIsLoading(true);
      await signIn?.create({ identifier: email });
      await sendOtpCode();

      return { signIn, isSuccess: true };
    } catch (error) {
      return { signIn, error, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const startAuthorization: UseAuthWithEmailOtpReturn['startAuthorization'] = async ({ email }) => {
    try {
      setIsLoading(true);
      await signUp?.create({ emailAddress: email });
      await sendOtpCode();

      return { signUp, signIn, isSuccess: true };
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        const error = e.errors[0];

        if (error?.code === OtpError.FORM_IDENTIFIER_EXIST) {
          await signIn?.create({ identifier: email });
          await sendOtpCode();

          return { signIn, signUp, isSuccess: true };
        }
      }

      return { signIn, signUp, error: e, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode: UseAuthWithEmailOtpReturn['verifyCode'] = async ({ code, tokenTemplate }) => {
    try {
      setIsVerifying(true);
      const isSignIn = !!signIn?.id;

      if (isSignIn) {
        const completeSignIn = await signIn.attemptFirstFactor({
          strategy: 'email_code',
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
        const completeSignUp = await signUp?.attemptEmailAddressVerification({
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
