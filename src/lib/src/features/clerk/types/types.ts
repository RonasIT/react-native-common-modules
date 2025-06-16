import { ClerkAPIError, EmailAddressResource, OAuthStrategy, PhoneNumberResource, SetActive, SignInResource, SignOut, SignUpResource, UserResource } from '@clerk/types';

type BaseSuccessReturn = { isSuccess: true; error?: never };

type BaseFailureReturn = { isSuccess?: false; error: ClerkAPIError | unknown };

type WithTokenSuccessReturn = BaseSuccessReturn & { sessionToken: string };

type WithTokenFailureReturn = BaseFailureReturn & { sessionToken?: null };

type WithSignInReturn = { signIn?: SignInResource };

type WithSignUpReturn = { signUp?: SignUpResource };

type WithClerkReturn = WithSignInReturn & WithSignUpReturn;

type StartSignUpReturn = (BaseSuccessReturn | BaseFailureReturn) & WithSignUpReturn;

type StartSignInReturn = (BaseSuccessReturn | BaseFailureReturn) & WithSignInReturn;

type StartAuthorizationReturn = (BaseSuccessReturn | BaseFailureReturn) & WithClerkReturn & { isSignUp?: boolean };

type AuthorizationFinishedReturn = (WithTokenSuccessReturn | WithTokenFailureReturn) & WithClerkReturn;

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
  verifyCode: (params: {
    code: string;
    strategy: OtpStrategy;
    tokenTemplate?: string;
  }) => Promise<AuthorizationFinishedReturn>;
  isVerifying: boolean;
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

export interface UseAuthWithSSOReturn {
  startSSOFlow: (params: StartSSOArgs) => Promise<AuthorizationFinishedReturn>;
  isLoading: boolean;
}

// OTP verification types:

export interface UseOtpVerificationReturn {
  sendOtpCode: (strategy: OtpStrategy) => Promise<void>;
  verifyCode: (params: { code: string; strategy: OtpStrategy; tokenTemplate?: string }) => Promise<AuthorizationFinishedReturn>;
  isVerifying: boolean;
}

export interface UseAddIdentifierReturn {
  createIdentifier: (params: {
    identifier: string;
  }) => Promise<(BaseSuccessReturn | BaseFailureReturn) & { user?: UserResource | null }>;
  verifyCode: (params: { code: string }) => Promise<
    (BaseSuccessReturn | (BaseFailureReturn & { verifyAttempt?: PhoneNumberResource | EmailAddressResource })) & {
      user?: UserResource | null;
    }
  >;
  isCreating: boolean;
  isVerifying: boolean;
}

// Auth with identifier types:

export type AuthIdentifierMethod = 'emailAddress' | 'phoneNumber' | 'username';

export type AuthIdentifierVerifyBy = 'otp' | 'password';

export type IdentifierMethodFor<VerifyBy extends AuthIdentifierVerifyBy> =
  VerifyBy extends 'otp' ? Exclude<AuthIdentifierMethod, 'username'> : AuthIdentifierMethod;

export type StartAuthParams<
  VerifyBy extends AuthIdentifierVerifyBy,
> = VerifyBy extends 'otp'
  ? { identifier: string }
  : { identifier: string; password: string; tokenTemplate?: string }

export type StartSignInWithIdentifierReturn<
  VerifyBy extends AuthIdentifierVerifyBy
> = VerifyBy extends 'password'
  ? StartSignInReturn & { sessionToken?: string } : StartSignInReturn;

export type StartSignUpWithIdentifierReturn<
  Method extends AuthIdentifierMethod
> = Method extends 'username'
  ? StartSignUpReturn & { sessionToken?: string } : StartSignUpReturn;

export type StartAuthorizationWithIdentifierReturn<
  Method extends AuthIdentifierMethod
> = Method extends 'username'
  ? StartAuthorizationReturn & { sessionToken?: string } : StartAuthorizationReturn;

interface BaseUseAuthWithIdentifierReturn<VerifyBy extends AuthIdentifierVerifyBy> {
  startSignIn: (params: StartAuthParams<VerifyBy>) => Promise<StartSignInWithIdentifierReturn<VerifyBy>>;
  startSignUp: (params: StartAuthParams<VerifyBy>) => Promise<StartSignUpWithIdentifierReturn<any>>;
  startAuthorization: (params: StartAuthParams<VerifyBy>) => Promise<StartAuthorizationWithIdentifierReturn<any>>;
  isLoading: boolean;
}

type ConditionalUseAuthWithIdentifierReturn<
  VerifyBy extends AuthIdentifierVerifyBy,
  Method extends AuthIdentifierMethod,
> = Method extends 'username'
  ? BaseUseAuthWithIdentifierReturn<VerifyBy>
  : BaseUseAuthWithIdentifierReturn<VerifyBy> & {
      verifyCode: (params: { code: string; tokenTemplate?: string }) => Promise<AuthorizationFinishedReturn>;
      isVerifying: boolean;
    };

export type UseAuthWithIdentifierReturn<
  VerifyBy extends AuthIdentifierVerifyBy,
  Method extends AuthIdentifierMethod,
> = ConditionalUseAuthWithIdentifierReturn<VerifyBy, Method>;

//Reset password types:

export interface UseResetPasswordReturn {
  startResetPassword: (params: {
    identifier: string;
  }) => Promise<(BaseSuccessReturn | BaseFailureReturn) & WithSignInReturn>;
  resetPassword: (params: {
    code: string;
    password: string;
    tokenTemplate?: string;
  }) => Promise<AuthorizationFinishedReturn>;
  isResetting: boolean;
  isCodeSending: boolean;
}

