import { ClerkAPIError, EmailAddressResource, OAuthStrategy, PhoneNumberResource, SetActive, SignInResource, SignOut, SignUpResource, UserResource } from '@clerk/types';

type BaseSuccessReturn = { isSuccess: true; error?: never };

type BaseFailureReturn = { isSuccess?: false; error: ClerkAPIError | unknown };

type WithTokenSuccessReturn = BaseSuccessReturn & { sessionToken: string };

type WithTokenFailureReturn = BaseFailureReturn & { sessionToken?: null };

type WithSignInReturn = {
  /** Provides access to SignIn object: https://clerk.com/docs/references/javascript/sign-in */
  signIn?: SignInResource;
};

type WithSignUpReturn = {
  /** Provides access to SignUp object: https://clerk.com/docs/references/javascript/sign-up */
  signUp?: SignUpResource;
};

type WithClerkReturn = WithSignInReturn & WithSignUpReturn;

type StartSignUpReturn = (BaseSuccessReturn | BaseFailureReturn) & WithSignUpReturn;

type StartSignInReturn = (BaseSuccessReturn | BaseFailureReturn) & WithSignInReturn;

type StartAuthorizationReturn = (BaseSuccessReturn | BaseFailureReturn) & WithClerkReturn & { isSignUp?: boolean };

type AuthorizationFinishedReturn = (WithTokenSuccessReturn | WithTokenFailureReturn) & WithClerkReturn;

/** Type for OTP methods (email or phone) */
export type OtpMethod = 'emailAddress' | 'phoneNumber';

/** Type for OTP strategies (email code or phone code) */
export type OtpStrategy = 'email_code' | 'phone_code';

export type UseClerkResourcesReturn = WithClerkReturn & {
  /** A function that sets the active session */
  setActive: SetActive;
  /** A function that signs out the current user */
  signOut: SignOut;
};

// Get token types

/**
 * Retrieves the session token for the currently authenticated user.
 *
 * @param params - Optional parameters for retrieving the session token.
 * @param params.tokenTemplate - (Optional) Name of the token template to use.
 *
 * @returns A Promise resolving to:
 * - { isSuccess: true, sessionToken: string } on success
 * - { isSuccess: false, sessionToken: null, error } on failure
 */
export type GetSessionTokenFn = (params: {
  tokenTemplate?: string;
}) => Promise<GetSessionTokenReturn>;

export interface UseGetSessionTokenReturn {
  /** Function to retrieve the session token */
  getSessionToken: GetSessionTokenFn;
}

export type GetSessionTokenReturn = WithTokenSuccessReturn | WithTokenFailureReturn;

// OTP verification types:

export interface UseOtpVerificationReturn {
  /** Sends an OTP code to the user's identifier */
  sendOtpCode: (strategy: OtpStrategy) => Promise<void>;
  /** Verifies the OTP code provided by the user */
  verifyCode: (params: {
    code: string;
    strategy: OtpStrategy;
    tokenTemplate?: string;
  }) => Promise<AuthorizationFinishedReturn>;
  /** Indicates whether a verification attempt is currently in progress */
  isVerifying: boolean;
}

// Ticket types:

export type StartAuthorizationWithTicketReturn = (WithTokenSuccessReturn | WithTokenFailureReturn) & WithSignInReturn;

export interface UseAuthWithTicketReturn {
  /**
   * Initiates authentication using a one-time ticket issued by the backend.
   * 
   * @param params - Parameters required to start the ticket-based authentication flow.
   * @param params.ticket - A valid ticket string issued by Clerk or your backend.
   * @param params.tokenTemplate - (Optional) The name of a token template to use when retrieving the session token.
   * 
   * @returns A Promise that resolves to a `StartAuthorizationWithTicketReturn` object, which can be either:
   * 
   * On success:
   * - `isSuccess: true`
   * - `sessionToken: string` — A valid session token string.
   * - `signIn?: SignInResource` — (Optional) SignIn object, present if the user needs to complete additional steps.
   * 
   * On failure:
   * - `isSuccess: false` or undefined
   * - `sessionToken: null`
   * - `error: ClerkAPIError | unknown` — Details about the error occurred.
   * - `signIn?: SignInResource` — (Optional) SignIn object if available.
   */
  startAuthorization: (params: {
    ticket: string;
    tokenTemplate?: string;
  }) => Promise<StartAuthorizationWithTicketReturn>;

  /**
   * Indicates whether the authentication process with the ticket is currently in progress.
   * 
   * `true` if a request is ongoing, otherwise `false`.
   */
  isLoading: boolean;
}


// SSO types:

/** Parameters for SSO flow */
export interface StartSSOArgs {
  /**
   * The OAuth strategy to use (e.g., 'oauth_google', 'oauth_facebook', etc.).
   * See Clerk's documentation for a full list of supported strategies: https://clerk.com/docs/references/expo/use-sso
   */
  strategy: OAuthStrategy;

  /**
   * Optional URL to redirect the user to after successful authentication.
   */
  redirectUrl?: string;
  
  /**
   * Optional name of a token template to use for customizing the returned session token.
   */
  tokenTemplate?: string;
}


/** Return type for useAuthWithSSO hook */
export interface UseAuthWithSSOReturn {
  /**
   * Initiates a Single Sign-On (SSO) authentication flow using the specified OAuth strategy.
   *
   * @param params - Parameters for initiating the SSO flow.
   * @param params.strategy - The OAuth strategy to use (e.g., 'oauth_google', 'oauth_facebook').
   * @param params.redirectUrl - (Optional) A URL to which the user will be redirected after the flow completes.
   * @param params.tokenTemplate - (Optional) A token template to use when requesting a session token.
   *
   * @returns A Promise that resolves to an object indicating the result of the authorization:
   * - `{ isSuccess: true, sessionToken: string, signIn?, signUp? }` on success
   * - `{ isSuccess: false, sessionToken: null, error, signIn?, signUp? }` on failure
   *
   * `signIn` and `signUp` may be present depending on the outcome and stage of the flow.
   */
  startSSOFlow: (params: StartSSOArgs) => Promise<AuthorizationFinishedReturn>;

  /**
   * Indicates whether the SSO authentication flow is currently in progress.
   *
   * `true` if an SSO request is being processed, otherwise `false`.
   */
  isLoading: boolean;
}


// OTP verification types:

export interface UseOtpVerificationReturn {
  /** Sends an OTP code to the user's identifier */
  sendOtpCode: (strategy: OtpStrategy) => Promise<void>;
  /** Verifies the OTP code provided by the user */
  verifyCode: (params: { code: string; strategy: OtpStrategy; tokenTemplate?: string }) => Promise<AuthorizationFinishedReturn>;
  /** Indicates whether a verification attempt is currently in progress */
  isVerifying: boolean;
}

export interface UseAddIdentifierReturn {
  /** Function to add a new identifier to the user's account */
  createIdentifier: (params: {
    identifier: string;
  }) => Promise<(BaseSuccessReturn | BaseFailureReturn) & { user?: UserResource | null }>;
  /** Function to verify a code sent to the identifier */
  verifyCode: (params: { code: string }) => Promise<
    (BaseSuccessReturn | (BaseFailureReturn & { verifyAttempt?: PhoneNumberResource | EmailAddressResource })) & {
      user?: UserResource | null;
    }
  >;
  /** Indicates whether an identifier is currently being added */
  isCreating: boolean;
  /** Indicates whether a verification code is currently being processed */
  isVerifying: boolean;
}

// Auth with identifier types:

/** Type for authentication identifier methods */
export type AuthIdentifierMethod = 'emailAddress' | 'phoneNumber' | 'username';

/** Type for authentication verification methods */
export type AuthIdentifierVerifyBy = 'otp' | 'password';

/** Type that maps verification methods to allowed identifier methods */
export type IdentifierMethodFor<VerifyBy extends AuthIdentifierVerifyBy> =
  VerifyBy extends 'otp' ? Exclude<AuthIdentifierMethod, 'username'> : AuthIdentifierMethod;

/** Type for authentication parameters based on verification method */
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
  /** Function to initiate sign-in */
  startSignIn: (params: StartAuthParams<VerifyBy>) => Promise<StartSignInWithIdentifierReturn<VerifyBy>>;
  /** Function to initiate sign-up */
  startSignUp: (params: StartAuthParams<VerifyBy>) => Promise<StartSignUpWithIdentifierReturn<any>>;
  /** Function to initiate authorization (sign-up or sign-in) */
  startAuthorization: (params: StartAuthParams<VerifyBy>) => Promise<StartAuthorizationWithIdentifierReturn<any>>;
  /** Indicates whether an authentication request is in progress */
  isLoading: boolean;
}

type ConditionalUseAuthWithIdentifierReturn<
  VerifyBy extends AuthIdentifierVerifyBy,
  Method extends AuthIdentifierMethod,
> = Method extends 'username'
  ? BaseUseAuthWithIdentifierReturn<VerifyBy>
  : BaseUseAuthWithIdentifierReturn<VerifyBy> & {
      /** Function to verify OTP code (only available for non-username methods) */
      verifyCode: (params: { code: string; tokenTemplate?: string }) => Promise<AuthorizationFinishedReturn>;
      /** Indicates whether an OTP verification is in progress (only available for non-username methods) */
      isVerifying: boolean;
    };

export type UseAuthWithIdentifierReturn<
  VerifyBy extends AuthIdentifierVerifyBy,
  Method extends AuthIdentifierMethod,
> = ConditionalUseAuthWithIdentifierReturn<VerifyBy, Method>;

//Reset password types:

export interface UseResetPasswordReturn {
  /** Function to initiate the password reset process */
  startResetPassword: (params: {
    identifier: string;
  }) => Promise<(BaseSuccessReturn | BaseFailureReturn) & WithSignInReturn>;
  /** Function to reset the user's password */
  resetPassword: (params: {
    code: string;
    password: string;
    tokenTemplate?: string;
  }) => Promise<AuthorizationFinishedReturn>;
  /** Indicates if the password is being reset */
  isResetting: boolean;
  /** Indicates if the verification code is being sent */
  isCodeSending: boolean;
}

