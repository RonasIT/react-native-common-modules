import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { SignInResource } from '@clerk/types';
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
import { useGetSessionToken } from './use-get-session-token';
import { useOtpVerification } from './use-otp-verification';

/**
 * Hook that provides functionality to handle user sign-up and sign-in processes using an identifier such as an email, phone number, or username. It supports both OTP (One Time Password) and password-based authentication methods.
 *
 * @template {AuthIdentifierVerifyBy} TVerifyBy - The verification method type
 * @template {IdentifierMethodFor<TVerifyBy>} TMethod - The identifier method type
 * @param {TMethod} method - Specifies the type of identifier used for authentication (e.g., 'emailAddress', 'phoneNumber', 'username')
 * @param {TVerifyBy} verifyBy - Specifies the verification method ('otp' for one-time passwords or 'password')
 *
 * @returns {UseAuthWithIdentifierReturn<TVerifyBy, TMethod>} Object containing:
 * - `startSignUp` - Initiates a new user registration using the specified identifier and verification method
 * - `startSignIn` - Initiates authentication of an existing user using the specified identifier and verification method
 * - `startAuthorization` - Determines whether to initiate a sign-up or sign-in based on whether the user has been registered previously
 * - `verifyCode` - Verifies an OTP code if the verification method is 'otp' (only available for non-username methods)
 * - `isLoading` - Indicates whether an authentication request is in progress
 * - `isVerifying` - Indicates whether an OTP verification is in progress (only available for non-username methods)
 */
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
