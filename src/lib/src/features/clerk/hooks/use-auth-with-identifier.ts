import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { useState } from 'react';
import { ClerkApiError } from '../enums';
import { AuthIdentifierVerifyBy, IdentifierMethodFor, StartAuthParams, StartSignInWithIdentifierReturn, StartSignUpWithIdentifierReturn, UseAuthWithIdentifierReturn } from '../types';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-token';
import { useOtpVerification } from './use-otp-verification';
import { SignInResource } from '@clerk/types';

export function useAuthWithIdentifier<VerifyBy extends AuthIdentifierVerifyBy, Method extends IdentifierMethodFor<VerifyBy>>(
  method: Method,
  verifyBy: VerifyBy
): UseAuthWithIdentifierReturn<VerifyBy, Method> {
  const { signUp, signIn, setActive } = useClerkResources();
  const { sendOtpCode, verifyCode: verifyOtpCode, isVerifying } = useOtpVerification();
  const { getSessionToken } = useGetSessionToken();
  const [isLoading, setIsLoading] = useState(false);
  const strategy = method === 'emailAddress' ? 'email_code' : 'phone_code';

  const startSignUp: UseAuthWithIdentifierReturn<VerifyBy, Method>['startSignUp'] = async (params) => {
    try {
      setIsLoading(true);
      const { identifier } = params;

      // Auth with username and password
      if (method === 'username') {
        const { password, tokenTemplate } = params as StartAuthParams<'password'>;
        const signUpAttempt = await signUp?.create({ username: identifier, password });

        if (signUpAttempt?.status === 'complete') {
          await setActive?.({ session: signUpAttempt.createdSessionId });
          const { sessionToken } = await getSessionToken({ tokenTemplate });

          return { sessionToken, signUp, isSuccess: true } as StartSignUpWithIdentifierReturn<Method>;
        }
        
        return { isSuccess: false, signUp } as StartSignUpWithIdentifierReturn<Method>;
      }

      // Auth with email or phone number
      if (verifyBy === 'password') {
        const { password } = params as StartAuthParams<'password'>;
        await signUp?.create({ [method]: identifier, password });
      } else if (verifyBy === 'otp') {
        await signUp?.create({ [method]: identifier });
      }

      await sendOtpCode(strategy);
      
      return { isSuccess: true, signUp };
    } catch (error) {
      return { error, signUp, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const startSignIn: UseAuthWithIdentifierReturn<VerifyBy, Method>['startSignIn'] = async (params) => {
    const handleSignInWithPassword = async (signInAttempt: SignInResource, tokenTemplate?: string): Promise<StartSignInWithIdentifierReturn<VerifyBy>> => {
      await setActive?.({ session: signInAttempt.createdSessionId });
      const { sessionToken, error } = await getSessionToken({ tokenTemplate });

      if (sessionToken) {
        return {
          signIn,
          error,
          sessionToken,
          isSuccess: true
        } as StartSignInWithIdentifierReturn<VerifyBy>;
      }

      return {
        signIn,
        error,
        isSuccess: false
      };
    }
    
    try {
      setIsLoading(true);
      const { identifier } = params;

      // Auth with username and password
      if (method === 'username') {
        const { password, tokenTemplate } = params as StartAuthParams<'password'>;
        const signInAttempt = await signIn?.create({ identifier, password });

        if (signInAttempt?.status === 'complete') {
          return handleSignInWithPassword(signInAttempt, tokenTemplate);
        }
      }

      // Auth with email or phone number
      if (verifyBy === 'password') {
        const { password, tokenTemplate } = params as StartAuthParams<'password'>;
        const signInAttempt = await signIn?.create({
          identifier,
          password
        });

        if (signInAttempt?.status === 'complete') {
          handleSignInWithPassword(signInAttempt, tokenTemplate);
        }
      } else if (verifyBy === 'otp') {
        await signIn?.create({ [method]: identifier });
        await sendOtpCode(strategy);

        return { isSuccess: true, signIn };
      }

      return { isSuccess: true, signIn };
    } catch (error) {
      return { error, signIn, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const startAuthorization: UseAuthWithIdentifierReturn<VerifyBy, Method>['startAuthorization'] = async (params) => {
    try {
      setIsLoading(true);
      const result = await startSignUp(params);

      if (result?.error && isClerkAPIResponseError(result.error)) {
        const error = result.error.errors[0];

        if (error?.code === ClerkApiError.FORM_IDENTIFIER_EXIST) {
          return await startSignIn(params);
        }
      }

      return result;
    } catch (error) {
      return { error, signIn, signUp, isSuccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode: UseAuthWithIdentifierReturn<VerifyBy, Method>['verifyCode'] = async ({ code, tokenTemplate }) => {
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