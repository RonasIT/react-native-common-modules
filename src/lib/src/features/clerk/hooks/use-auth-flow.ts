import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { ClerkApiError } from '../enums'; // Your existing enums
import { AuthIdentifierVerifyBy, AuthIdentifierMethod, AuthResult } from '../types/shared';
import { StartSignInParams } from '../types/sign-in';
import { StartSignUpParams } from '../types/sign-up';
import { useOtpVerification } from './use-otp-verification';
import { useSignIn } from './use-sign-in';
import { useSignUp } from './use-sign-up';

// Intersection of params for the auto-flow
type AuthFlowParams<VerifyBy extends AuthIdentifierVerifyBy> = StartSignUpParams<VerifyBy> &
  StartSignInParams<VerifyBy>;

export function useAuthFlow<TVerifyBy extends AuthIdentifierVerifyBy, TMethod extends AuthIdentifierMethod>(
  method: TMethod,
  verifyBy: TVerifyBy,
) {
  // 1. Compose the atomic hooks
  const signUpHook = useSignUp<TVerifyBy, TMethod>(method, verifyBy);
  const signInHook = useSignIn<TVerifyBy, TMethod>(method, verifyBy);
  const { verifyCode, isVerifying } = useOtpVerification();

  const isLoading = signUpHook.isLoading || signInHook.isLoading;

  /**
   * Attempts to Sign Up. If user exists, attempts to Sign In.
   */
  const startAuth = async (params: AuthFlowParams<TVerifyBy>): Promise<AuthResult<any> & { isSignUp?: boolean }> => {
    // 1. Try Sign Up
    const signUpResult = await signUpHook.startSignUp(params);

    // 2. If Sign Up failed because user exists, Try Sign In
    if (signUpResult.error && isClerkAPIResponseError(signUpResult.error)) {
      const error = signUpResult.error.errors[0];

      if (error?.code === ClerkApiError.FORM_IDENTIFIER_EXIST) {
        // Fallback to Sign In
        // Note: We pass the same params. SignIn will ignore extra SignUp fields (like firstName)
        const signInResult = await signInHook.startSignIn(params as StartSignInParams<TVerifyBy>);

        return { ...signInResult, isSignUp: false };
      }
    }

    // 3. Return Sign Up result (success or other error)
    return { ...signUpResult, isSignUp: true };
  };

  // Expose everything needed for the UI
  return {
    startAuth,
    // Expose atomic methods if specific control is needed
    startSignUp: signUpHook.startSignUp,
    startSignIn: signInHook.startSignIn,
    // Verification
    verifyCode: method !== 'username' ? verifyCode : undefined,
    isVerifying: method !== 'username' ? isVerifying : undefined,
    isLoading,
  };
}
