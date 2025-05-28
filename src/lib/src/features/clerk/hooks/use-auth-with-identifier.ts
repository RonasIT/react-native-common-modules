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

  const handleSessionToken = async (tokenTemplate?: string): Promise<{ sessionToken?: string; error?: unknown }> => {
    const { sessionToken, error } = await getSessionToken({ tokenTemplate });
    return { sessionToken: sessionToken || undefined, error };
  };

  const handleSignInWithPassword = async (
    signInAttempt: SignInResource,
    isSignUp: boolean,
    tokenTemplate?: string
  ): Promise<StartSignInWithIdentifierReturn<VerifyBy> | StartSignUpWithIdentifierReturn<Method>> => {
    await setActive?.({ session: signInAttempt.createdSessionId });
    const { sessionToken, error } = await handleSessionToken(tokenTemplate);

    if (isSignUp) {
      return {
        signUp,
        error,
        sessionToken,
        isSuccess: !!sessionToken
      } as StartSignUpWithIdentifierReturn<Method>;
    }

    return {
      signIn,
      error,
      sessionToken,
      isSuccess: !!sessionToken
    } as StartSignInWithIdentifierReturn<VerifyBy>;
  };

  const handleUsernameAuth = async (
    params: StartAuthParams<'password'>,
    isSignUp: boolean
  ): Promise<StartSignInWithIdentifierReturn<VerifyBy> | StartSignUpWithIdentifierReturn<Method>> => {
    const { identifier, password, tokenTemplate } = params;
    const authMethod = isSignUp ? signUp : signIn;
    const authAttempt = await authMethod?.create({ username: identifier, password });

    if (authAttempt?.status === 'complete' && 'createdSessionId' in authAttempt) {
      return handleSignInWithPassword(authAttempt as SignInResource, isSignUp, tokenTemplate);
    }

    return {
      isSuccess: false,
      [isSignUp ? 'signUp' : 'signIn']: authMethod
    } as StartSignInWithIdentifierReturn<VerifyBy> | StartSignUpWithIdentifierReturn<Method>;
  };

  const handleEmailPhoneAuth = async (
    params: StartAuthParams<VerifyBy>,
    isSignUp: boolean
  ): Promise<StartSignInWithIdentifierReturn<VerifyBy> | StartSignUpWithIdentifierReturn<Method>> => {
    const { identifier } = params;
    const authMethod = isSignUp ? signUp : signIn;

    if (verifyBy === 'password') {
      const { password, tokenTemplate } = params as StartAuthParams<'password'>;
      const authAttempt = await authMethod?.create({ [method]: identifier, password });

      if (authAttempt?.status === 'complete' && 'createdSessionId' in authAttempt) {
        return handleSignInWithPassword(authAttempt as SignInResource, isSignUp, tokenTemplate);
      }
    } else if (verifyBy === 'otp') {
      await authMethod?.create({ [method]: identifier });
      await sendOtpCode(strategy);
    }

    return {
      isSuccess: true,
      [isSignUp ? 'signUp' : 'signIn']: authMethod
    } as StartSignInWithIdentifierReturn<VerifyBy> | StartSignUpWithIdentifierReturn<Method>;
  };

  const startSignUp: UseAuthWithIdentifierReturn<VerifyBy, Method>['startSignUp'] = async (params) => {
    try {
      setIsLoading(true);
      return method === 'username'
        ? handleUsernameAuth(params as StartAuthParams<'password'>, true)
        : handleEmailPhoneAuth(params, true);
    } catch (error) {
      return { error, signUp, isSuccess: false } as StartSignUpWithIdentifierReturn<Method>;
    } finally {
      setIsLoading(false);
    }
  };

  const startSignIn: UseAuthWithIdentifierReturn<VerifyBy, Method>['startSignIn'] = async (params) => {
    try {
      setIsLoading(true);
      return method === 'username'
        ? handleUsernameAuth(params as StartAuthParams<'password'>, false)
        : handleEmailPhoneAuth(params, false);
    } catch (error) {
      return { error, signIn, isSuccess: false } as StartSignInWithIdentifierReturn<VerifyBy>;
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
      return { error, signIn, signUp, isSuccess: false } as StartSignInWithIdentifierReturn<VerifyBy>;
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