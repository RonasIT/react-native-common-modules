import { EmailCodeFactor, PhoneCodeFactor } from '@clerk/types';
import { useState } from 'react';
import { OtpStrategy, UseOtpVerificationReturn } from '../types/types';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-session-token';

/**
 * Hook that provides functionality for managing OTP (One Time Password) verification in user authentication workflows, supporting both sign-up and sign-in processes.
 *
 * @returns {UseOtpVerificationReturn} Object containing:
 * - `sendOtpCode` - Sends an OTP code to the user's identifier (email or phone number) based on the specified strategy
 * - `verifyCode` - Verifies the OTP code provided by the user, completing the authentication process
 * - `isVerifying` - A boolean indicating whether a verification attempt is currently in progress
 */
export function useOtpVerification(): UseOtpVerificationReturn {
  const { signUp, signIn, setActive } = useClerkResources();
  const { getSessionToken } = useGetSessionToken();
  const [isVerifying, setIsVerifying] = useState(false);

  const sendSignInOtpCode = async (strategy: OtpStrategy, isSecondFactor: boolean = false): Promise<void> => {
    const codeFactors = isSecondFactor ? signIn?.supportedSecondFactors : signIn?.supportedFirstFactors;
    const prepareFactor = isSecondFactor ? signIn?.prepareSecondFactor : signIn?.prepareFirstFactor;
    const codeFactor = codeFactors?.find(
      (factor): factor is EmailCodeFactor | PhoneCodeFactor => factor.strategy === strategy,
    );

    if (codeFactor && 'emailAddressId' in codeFactor) {
      await prepareFactor?.({ strategy: 'email_code', emailAddressId: codeFactor.emailAddressId });
    } else if (codeFactor && 'phoneNumberId' in codeFactor) {
      await prepareFactor?.({ strategy: 'phone_code', phoneNumberId: codeFactor.phoneNumberId });
    } else {
      throw new Error(`No ${isSecondFactor ? 'second ' : ''}factor found for strategy: ${strategy}`);
    }
  };

  const sendSignUpOtpCode = async (strategy: OtpStrategy): Promise<void> => {
    if (!signUp) return;
    await signUp.prepareVerification({ strategy });
  };

  const sendOtpCode: UseOtpVerificationReturn['sendOtpCode'] = async ({ strategy, isSignUp, isSecondFactor }) => {
    if (isSignUp) {
      await sendSignUpOtpCode(strategy);
    } else {
      await sendSignInOtpCode(strategy, !!isSecondFactor);
    }
  };

  const verifyCode: UseOtpVerificationReturn['verifyCode'] = async ({
    code,
    strategy,
    tokenTemplate,
    isSignUp,
    isSecondFactor,
  }) => {
    try {
      setIsVerifying(true);

      if (isSignUp) {
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
      } else {
        const attemptSignIn = isSecondFactor ? signIn?.attemptSecondFactor : signIn?.attemptFirstFactor;
        const completeSignIn = await attemptSignIn?.({ strategy, code });

        if (completeSignIn?.status === 'complete') {
          await setActive?.({ session: completeSignIn.createdSessionId });
          const sessionToken = (await getSessionToken({ tokenTemplate })).sessionToken;

          if (sessionToken) {
            return { sessionToken, signIn, signUp, isSuccess: true };
          }

          return { sessionToken: null, signIn, signUp, isSuccess: false };
        }
      }

      return {
        signIn,
        signUp,
        isSuccess: false,
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
