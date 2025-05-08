import { ClerkAPIError, SetActive, SignInResource, SignOut, SignUpResource } from '@clerk/types';

type BaseSuccessReturn = { isSuccess: true; error?: never };

type BaseFailureReturn = { isSuccess?: false; error: ClerkAPIError | unknown };

type WithTokenSuccessReturn = BaseSuccessReturn & { sessionToken: string };

type WithTokenFailureReturn = BaseFailureReturn & { sessionToken?: null };

type WithSignInReturn = { signIn?: SignInResource };

type WithSignUpReturn = { signUp?: SignUpResource };

type WithClerkReturn = WithSignInReturn & WithSignUpReturn;

type StartSignUpReturn = (BaseSuccessReturn | BaseFailureReturn) & WithSignUpReturn;

type StartSignInReturn = (BaseSuccessReturn | BaseFailureReturn) & WithSignInReturn;

type StartAuthorizationReturn = (BaseSuccessReturn | BaseFailureReturn) & WithClerkReturn;

type AuthorizationFinishedReturn = (WithTokenSuccessReturn | WithTokenFailureReturn) & WithClerkReturn;

export type OtpMethod = 'emailAddress' | 'phone';

export type UseClerkResourcesReturn = WithClerkReturn & {
  setActive: SetActive;
  signOut: SignOut;
};

//Get token types

export interface UseGetSessionTokenReturn {
  getSessionToken: (params: { tokenTemplate?: string }) => Promise<GetSessionTokenReturn>;
}

export type GetSessionTokenReturn = WithTokenSuccessReturn | WithTokenFailureReturn;

// OTP types:

export interface UseAuthWithOtpReturn {
  startSignIn: (params: { identifier: string; method: OtpMethod }) => Promise<StartSignInReturn>;
  startSignUp: (params: { identifier: string; method: OtpMethod }) => Promise<StartSignUpReturn>;
  startAuthorization: (params: { identifier: string; method: OtpMethod }) => Promise<StartAuthorizationReturn>;
  sendOtpCode: () => Promise<void>;
  verifyCode: (params: { code: string; tokenTemplate?: string }) => Promise<AuthorizationFinishedReturn>;
  isLoading: boolean;
  isVerifying: boolean;
}
