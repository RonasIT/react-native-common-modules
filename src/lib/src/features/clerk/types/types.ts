import { ClerkAPIError, OAuthStrategy, SetActive, SignInResource, SignOut, SignUpResource } from '@clerk/types';

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

type StartIdentifierPasswordAuthorizationReturn =
  | AuthorizationFinishedReturn
  | (StartAuthorizationReturn & { sessionToken?: null });

export type OtpMethod = 'emailAddress' | 'phoneNumber';

export type OtpStrategy = 'email_code' | 'phone_code';

export type UseClerkResourcesReturn = WithClerkReturn & {
  setActive: SetActive;
  signOut: SignOut;
};

// Get token types

export interface UseGetSessionTokenReturn {
  getSessionToken: (params: { tokenTemplate?: string }) => Promise<GetSessionTokenReturn>;
}

export type GetSessionTokenReturn = WithTokenSuccessReturn | WithTokenFailureReturn;

// OTP verification types:

export interface UseOtpVerificationReturn {
  sendOtpCode: (strategy: OtpStrategy) => Promise<void>;
  verifyCode: (params: { code: string; strategy: OtpStrategy; tokenTemplate?: string }) => Promise<AuthorizationFinishedReturn>;
  isVerifying: boolean;
}

// OTP types:

export interface UseAuthWithOtpReturn extends Omit<UseOtpVerificationReturn, 'verifyCode'> {
  startSignIn: (params: { identifier: string; method: OtpMethod }) => Promise<StartSignInReturn>;
  startSignUp: (params: { identifier: string; method: OtpMethod }) => Promise<StartSignUpReturn>;
  startAuthorization: (params: { identifier: string; method: OtpMethod }) => Promise<StartAuthorizationReturn>;
  verifyCode: (params: { code: string; tokenTemplate?: string }) => Promise<AuthorizationFinishedReturn>;
  isLoading: boolean;
}

// Ticket types:

export type StartAuthorizationWithTicketReturn = (WithTokenSuccessReturn | WithTokenFailureReturn) & WithSignInReturn;

export interface UseAuthWithTicketReturn {
  startAuthorization: (params: {
    ticket: string;
    tokenTemplate?: string;
  }) => Promise<StartAuthorizationWithTicketReturn>;
  isLoading: boolean;
}

// SSO types:

export interface StartSSOArgs {
  strategy: OAuthStrategy;
  redirectUrl?: string;
  tokenTemplate?: string;
}

// Auth with password types:

export type AuthPasswordMethod = 'emailAddress' | 'phoneNumber';

export interface UseAuthWithPasswordReturn {
  startSignIn: (params: {
    identifier: string;
    password: string;
    tokenTemplate?: string;
  }) => Promise<AuthorizationFinishedReturn>;
  startSignUp: (params: {
    identifier: string;
    password: string;
    tokenTemplate?: string;
  }) => Promise<StartSignUpReturn>;
  startAuthorization: (params: {
    identifier: string;
    password: string;
    tokenTemplate?: string;
  }) => Promise<StartIdentifierPasswordAuthorizationReturn>;
  isLoading: boolean;
}

// Auth with password and OTP types (email/phone):
export interface UseAuthWithPasswordOtpReturn extends UseAuthWithPasswordReturn, Omit<UseOtpVerificationReturn, 'verifyCode'> {
  verifyCode: (params: { code: string, tokenTemplate?: string }) => Promise<AuthorizationFinishedReturn>;
}