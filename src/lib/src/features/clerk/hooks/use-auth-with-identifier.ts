import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { useState } from 'react';
import { ClerkApiError } from '../enums';
import {
  AuthIdentifierVerifyBy,
  IdentifierMethodFor,
  StartAuthParams,
  StartSignInWithIdentifierReturn,
  StartSignUpWithIdentifierReturn,
  UseAuthWithIdentifierReturn,
} from '../types';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-token';
import { useOtpVerification } from './use-otp-verification';
import { SignInResource } from '@clerk/types';

export function useAuthWithIdentifier<
  TVerifyBy extends AuthIdentifierVerifyBy,
  TMethod extends IdentifierMethodFor<TVerifyBy>,
>(method: TMethod, verifyBy: TVerifyBy): UseAuthWithIdentifierReturn<TVerifyBy, TMethod> {
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
    tokenTemplate?: string,
  ): Promise<StartSignInWithIdentifierReturn<TVerifyBy> | StartSignUpWithIdentifierReturn<TMethod>> => {
    await setActive?.({ session: signInAttempt.createdSessionId });
    const { sessionToken, error } = await handleSessionToken(tokenTemplate);

    if (isSignUp) {
      return {
        signUp,
        error,
        sessionToken,
        isSuccess: !!sessionToken,
      } as StartSignUpWithIdentifierReturn<TMethod>;
    }

    return {
      signIn,
      error,
      sessionToken,
      isSuccess: !!sessionToken,
    } as StartSignInWithIdentifierReturn<TVerifyBy>;
  };

  const handleUsernameAuth = async (
    params: StartAuthParams<'password'>,
    isSignUp: boolean,
  ): Promise<StartSignInWithIdentifierReturn<TVerifyBy> | StartSignUpWithIdentifierReturn<TMethod>> => {
    const { identifier, password, tokenTemplate } = params;
    const authMethod = isSignUp ? signUp : signIn;
    const authAttempt = await authMethod?.create({ username: identifier, password });

    if (authAttempt?.status === 'complete' && 'createdSessionId' in authAttempt) {
      return handleSignInWithPassword(authAttempt as SignInResource, isSignUp, tokenTemplate);
    }

    return {
      isSuccess: false,
      [isSignUp ? 'signUp' : 'signIn']: authMethod,
    } as StartSignInWithIdentifierReturn<TVerifyBy> | StartSignUpWithIdentifierReturn<TMethod>;
  };

  const handleEmailPhoneAuth = async (
    params: StartAuthParams<TVerifyBy>,
    isSignUp: boolean,
  ): Promise<StartSignInWithIdentifierReturn<TVerifyBy> | StartSignUpWithIdentifierReturn<TMethod>> => {
    const { identifier } = params;
    const authMethod = isSignUp ? signUp : signIn;
    const identifierFieldName = isSignUp ? method : 'identifier';

    if (verifyBy === 'password') {
      try {
        const { password, tokenTemplate } = params as StartAuthParams<'password'>;
        const authAttempt = await authMethod?.create({ [identifierFieldName]: identifier, password });

        if (authAttempt?.status === 'complete' && 'createdSessionId' in authAttempt) {
          return handleSignInWithPassword(authAttempt as SignInResource, isSignUp, tokenTemplate);
        }
      } catch (error) {
        return { error, signIn, signUp };
      }
    } else if (verifyBy === 'otp') {
      try {
        await authMethod?.create({ [identifierFieldName]: identifier });
        await sendOtpCode(strategy);
      } catch (error) {
        return { error, signIn, signUp };
      }
    }

    return {
      isSuccess: true,
      [isSignUp ? 'signUp' : 'signIn']: authMethod,
    } as StartSignInWithIdentifierReturn<TVerifyBy> | StartSignUpWithIdentifierReturn<TMethod>;
  };

  const startSignUp: UseAuthWithIdentifierReturn<TVerifyBy, TMethod>['startSignUp'] = async (params) => {
    try {
      setIsLoading(true);
      return method === 'username'
        ? handleUsernameAuth(params as StartAuthParams<'password'>, true)
        : handleEmailPhoneAuth(params, true);
    } catch (error) {
      return { error, signUp, isSuccess: false } as StartSignUpWithIdentifierReturn<TMethod>;
    } finally {
      setIsLoading(false);
    }
  };

  const startSignIn: UseAuthWithIdentifierReturn<TVerifyBy, TMethod>['startSignIn'] = async (params) => {
    try {
      setIsLoading(true);
      return method === 'username'
        ? handleUsernameAuth(params as StartAuthParams<'password'>, false)
        : handleEmailPhoneAuth(params, false);
    } catch (error) {
      return { error, signIn, isSuccess: false } as StartSignInWithIdentifierReturn<TVerifyBy>;
    } finally {
      setIsLoading(false);
    }
  };

  const startAuthorization: UseAuthWithIdentifierReturn<TVerifyBy, TMethod>['startAuthorization'] = async (params) => {
    try {
      setIsLoading(true);
      const result = await startSignUp(params);

      if (result?.error && isClerkAPIResponseError(result.error)) {
        const error = result.error.errors[0];
        if (error?.code === ClerkApiError.FORM_IDENTIFIER_EXIST) {
          return await startSignIn(params);
        }
      }

      return { ...result, isSignUp: true };
    } catch (error) {
      return { error, signIn, signUp, isSuccess: false } as StartSignInWithIdentifierReturn<TVerifyBy>;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async ({ code, tokenTemplate }: { code: string; tokenTemplate?: string }) => {
    return verifyOtpCode({ code, strategy, tokenTemplate });
  };

  if (method === 'username') {
    return {
      startSignIn,
      startSignUp,
      startAuthorization,
      isLoading,
    } as UseAuthWithIdentifierReturn<TVerifyBy, TMethod>;
  } else {
    return {
      startSignIn,
      startSignUp,
      startAuthorization,
      isLoading,
      verifyCode,
      isVerifying,
    } as UseAuthWithIdentifierReturn<TVerifyBy, TMethod>;
  }
}