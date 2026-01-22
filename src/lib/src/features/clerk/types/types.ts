import {
  ClerkAPIError,
  EmailAddressResource,
  OAuthStrategy,
  PhoneNumberResource,
  SetActive,
  SignInResource,
  SignOut,
  SignUpCreateParams,
  SignUpResource,
  UserResource,
} from '@clerk/types';

// #region --- BASE & UTILITY TYPES ---

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

/** Type for extra params during SignUp process */
export type SignUpParams = Pick<
  SignUpCreateParams,
  'firstName' | 'lastName' | 'locale' | 'unsafeMetadata' | 'username'
>;

// #endregion

// #region --- CORE RESOURCES & SESSION ---

export type UseClerkResourcesReturn = WithClerkReturn & {
  /** A function that sets the active session */
  setActive: SetActive;
  /** A function that signs out the current user */
  signOut: SignOut;
};

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
export type GetSessionTokenFn = (params: { tokenTemplate?: string }) => Promise<GetSessionTokenReturn>;

export interface UseGetSessionTokenReturn {
  /** Function to retrieve the session token */
  getSessionToken: GetSessionTokenFn;
}

export type GetSessionTokenReturn = WithTokenSuccessReturn | WithTokenFailureReturn;

// #endregion

// #region --- TICKET AUTHENTICATION ---

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

  /** Indicates whether the authentication process with the ticket is currently in progress. `true` or `false` */
  isLoading: boolean;
}

// #endregion

// #region --- SSO FLOW ---

/** Parameters for SSO flow */
export interface StartSSOArgs {
  /**
   * The OAuth strategy to use (e.g., 'oauth_google', 'oauth_facebook', etc.).
   * See Clerk's documentation for a full list of supported strategies: https://clerk.com/docs/references/expo/use-sso
   */
  strategy: OAuthStrategy;

  /** Optional URL to redirect the user to after successful authentication. */
  redirectUrl?: string;

  /** Optional name of a token template to use for customizing the returned session token. */
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

  /** Indicates whether the SSO authentication flow is currently in progress. `true` or `false` */
  isLoading: boolean;
}

// #endregion

// #region --- OTP VERIFICATION ---

/** Provides functionality for sending and verifying OTP (one-time password) codes using email or phone. */
export interface UseOtpVerificationReturn {
  /**
   * Sends a one-time password (OTP) code to the user's identifier (email or phone number),
   * using the selected strategy.
   *
   * @param strategy - The delivery method for the OTP code.
   * - `'email_code'` – send code via email
   * - `'phone_code'` – send code via SMS
   *
   * @returns A Promise that resolves once the OTP has been successfully sent, or rejects if sending fails.
   */
  sendOtpCode: (strategy: OtpStrategy) => Promise<void>;

  /**
   * Verifies the OTP code entered by the user.
   *
   * @param params - Parameters required to verify the code.
   * @param params.code - The OTP code received by the user.
   * @param params.strategy - The strategy used to send the code (`'email_code'` or `'phone_code'`).
   * @param params.tokenTemplate - (Optional) The name of the token template to use when retrieving the session token.
   *
   * @returns A Promise that resolves to:
   * - `{ isSuccess: true, sessionToken: string, signIn?, signUp? }` on success
   * - `{ isSuccess: false, sessionToken: null, error, signIn?, signUp? }` on failure
   */
  verifyCode: (params: {
    code: string;
    strategy: OtpStrategy;
    tokenTemplate?: string;
  }) => Promise<AuthorizationFinishedReturn>;

  /** Indicates whether the OTP verification process is currently in progress. `true` or `false` */
  isVerifying: boolean;
}

// #endregion

// #region --- IDENTIFIER MANAGEMENT ---

/**
 * Return type for a hook that manages adding a new authentication identifier
 * (such as an email address or phone number) to the currently signed-in user's account.
 */
export interface UseAddIdentifierReturn {
  /**
   * Sends a request to create and link a new identifier (email or phone) to the current user.
   *
   * This triggers a verification flow (e.g., a code sent via email or SMS) and returns
   * a result indicating success or failure. On success, the identifier is pending verification.
   *
   * @param params - Parameters for identifier creation.
   * @param params.identifier - The new identifier to be added (e.g., email or phone number).
   *
   * @returns A Promise resolving to a result object:
   * - On success: `BaseSuccessReturn` with optional `user`.
   * - On failure: `BaseFailureReturn` with optional `user`.
   */
  createIdentifier: (params: { identifier: string }) => Promise<
    (BaseSuccessReturn | BaseFailureReturn) & {
      user?: UserResource | null;
    }
  >;

  /**
   * Verifies the code sent to the newly added identifier.
   *
   * @param params - Parameters for verification.
   * @param params.code - The one-time code sent to the identifier.
   *
   * @returns A Promise resolving to a result object:
   * - On success: `BaseSuccessReturn` with optional `user`.
   * - On failure: `BaseFailureReturn` with optional `verifyAttempt` (email or phone resource) and `user`.
   */
  verifyCode: (params: { code: string }) => Promise<
    (
      | BaseSuccessReturn
      | (BaseFailureReturn & {
          verifyAttempt?: PhoneNumberResource | EmailAddressResource;
        })
    ) & {
      user?: UserResource | null;
    }
  >;

  /** Indicates whether an identifier is currently being added via `createIdentifier`. `true` or `false` */
  isCreating: boolean;

  /** Indicates whether a verification request is currently being processed via `verifyCode`. `true` or `false` */
  isVerifying: boolean;
}

// #endregion

// #region --- AUTH WITH IDENTIFIER ---

/** Type for authentication identifier methods */
export type AuthIdentifierMethod = 'emailAddress' | 'phoneNumber' | 'username';

/** Type for authentication verification methods */
export type AuthIdentifierVerifyBy = 'otp' | 'password';

/**
 * Maps verification method to the allowed identifier methods.
 *
 * - For `'otp'`, only email and phone are allowed.
 * - For `'password'`, all methods are allowed.
 */
export type IdentifierMethodFor<VerifyBy extends AuthIdentifierVerifyBy> = VerifyBy extends 'otp'
  ? Exclude<AuthIdentifierMethod, 'username'>
  : AuthIdentifierMethod;

/**
 * Parameters for starting an authentication flow, based on the selected verification method.
 *
 * - For `'otp'`: requires only an identifier (email or phone).
 * - For `'password'`: requires identifier and password, and optionally a token template.
 */
export type StartAuthParams<VerifyBy extends AuthIdentifierVerifyBy> = VerifyBy extends 'otp'
  ? {
      /** Identifier (email address or phone number). */
      identifier: string;
    }
  : {
      /** Identifier (email address, phone number, or username). */
      identifier: string;
      /** User's password. */
      password: string;
      /** Optional name of a token template for customizing the session token. */
      tokenTemplate?: string;
    };

/**
 * Return type for starting a sign-in flow.
 *
 * - For `'password'`: may include a `sessionToken`.
 * - For `'otp'`: standard return type.
 */
export type StartSignInWithIdentifierReturn<VerifyBy extends AuthIdentifierVerifyBy> = VerifyBy extends 'password'
  ? StartSignInReturn & {
      /** Optional session token returned upon successful password sign-in. */
      sessionToken?: string;
    }
  : StartSignInReturn;

/**
 * Return type for starting a sign-up flow.
 *
 * - For `'username'`: may include a `sessionToken`.
 * - For others: standard return type.
 */
export type StartSignUpWithIdentifierReturn<Method extends AuthIdentifierMethod> = Method extends 'username'
  ? StartSignUpReturn & {
      /** Optional session token returned upon successful username sign-up. */
      sessionToken?: string;
    }
  : StartSignUpReturn;

/**
 * Return type for starting a generic authorization (sign-up or sign-in).
 *
 * - For `'username'`: may include a `sessionToken`.
 * - For others: standard return type.
 */
export type StartAuthorizationWithIdentifierReturn<Method extends AuthIdentifierMethod> = Method extends 'username'
  ? StartAuthorizationReturn & {
      /** Optional session token returned upon successful username authorization. */
      sessionToken?: string;
    }
  : StartAuthorizationReturn;

export type StartSignUpParams<VerifyBy extends AuthIdentifierVerifyBy> = StartAuthParams<VerifyBy> & SignUpParams;

/**
 * Base return type for useAuthWithIdentifier hook.
 *
 * Provides common methods and status flags for both verification methods (`otp`, `password`).
 */
interface BaseUseAuthWithIdentifierReturn<VerifyBy extends AuthIdentifierVerifyBy> {
  /**
   * Initiates the sign-in flow using the provided identifier and verification method.
   *
   * @param params - Authentication parameters depending on `VerifyBy` type.
   * @returns A Promise resolving to a result of sign-in attempt.
   *
   * @example
   * // Example for email + password
   * await startSignIn({
   * identifier: 'user@example.com',
   * password: 'securePassword123'
   * });
   *
   * @example
   * // Example for phone + OTP
   * await startSignIn({
   * identifier: '+1234567890'
   * });
   */
  startSignIn: (params: StartAuthParams<VerifyBy>) => Promise<StartSignInWithIdentifierReturn<VerifyBy>>;
  /**
   * Initiates the sign-up flow using the provided identifier and verification method.
   *
   * @param params - Authentication parameters depending on `VerifyBy` type.
   * @returns A Promise resolving to a result of sign-up attempt.
   *
   * @example
   * // Example 1: Sign up with email + OTP
   * await startSignUp({
   * identifier: 'user@example.com',
   * });
   *
   * @example
   * // Example 2: Sign up with phone + OTP
   * await startSignUp({
   * identifier: '+1234567890',
   * });
   *
   * @example
   * // Example 3: Sign up with username + password
   * await startSignUp({
   * identifier: 'username',
   * password: 'password!'
   * });
   *
   * @example
   * // Example 4: Sign up with email + password + custom token template
   * await startSignUp({
   * identifier: 'user@example.com',
   * password: 'password',
   * tokenTemplate: 'my_template'
   * });
   */
  startSignUp: (params: StartSignUpParams<VerifyBy>) => Promise<StartSignUpWithIdentifierReturn<any>>;

  /**
   * Initiates a combined authorization flow (sign-up or sign-in) based on user existence.
   *
   * @param params - Authentication parameters depending on `VerifyBy` type.
   * @returns A Promise resolving to a result of the authorization flow.
   *
   * @example
   * // Example 1: Authorize with email + OTP (sign-in or sign-up automatically)
   * await startAuthorization({
   * identifier: 'user@example.com',
   * });
   *
   * @example
   * // Example 2: Authorize with phone + OTP
   * await startAuthorization({
   * identifier: '+1234567890',
   * });
   *
   * @example
   * // Example 3: Authorize with username + password
   * await startAuthorization({
   * identifier: 'username',
   * password: 'password'
   * });
   *
   * @example
   * // Example 4: Authorize with email + password + token template
   * await startAuthorization({
   * identifier: 'user@example.com',
   * password: 'password',
   * tokenTemplate: 'my_template'
   * });
   */
  startAuthorization: (params: StartAuthParams<VerifyBy>) => Promise<StartAuthorizationWithIdentifierReturn<any>>;

  /** Indicates whether an authentication request is currently being processed. `true` or `false` */
  isLoading: boolean;
}

/**
 * Conditional return type for `useAuthWithIdentifier` depending on identifier method.
 *
 * - Adds OTP-specific fields (`verifyCode`, `isVerifying`) for `emailAddress` and `phoneNumber`.
 * - These fields are omitted for `username`.
 */
type ConditionalUseAuthWithIdentifierReturn<
  VerifyBy extends AuthIdentifierVerifyBy,
  Method extends AuthIdentifierMethod,
> = Method extends 'username'
  ? BaseUseAuthWithIdentifierReturn<VerifyBy>
  : BaseUseAuthWithIdentifierReturn<VerifyBy> & {
      /**
       * Verifies the OTP code sent to the user.
       *
       * Only available when using `emailAddress` or `phoneNumber`.
       *
       * @param params.code - The one-time code entered by the user.
       * @param params.tokenTemplate - (Optional) Token template to customize the session.
       * @returns A Promise resolving to the final result of the authorization flow.
       */
      verifyCode: (params: { code: string; tokenTemplate?: string }) => Promise<AuthorizationFinishedReturn>;
      /** Indicates whether OTP verification is currently in progress. `true` or `false` */
      isVerifying: boolean;
    };

/**
 * Final return type of `useAuthWithIdentifier` hook.
 *
 * - Includes all sign-in, sign-up, and authorization methods.
 * - May include `verifyCode` and `isVerifying` if applicable.
 *
 * @template VerifyBy - Verification method used (`otp` or `password`)
 * @template Method - Identifier method used (`emailAddress`, `phoneNumber`, `username`)
 */
export type UseAuthWithIdentifierReturn<
  VerifyBy extends AuthIdentifierVerifyBy,
  Method extends AuthIdentifierMethod,
> = ConditionalUseAuthWithIdentifierReturn<VerifyBy, Method>;

// #endregion

// #region --- PASSWORD RESET FLOW ---

/** Return type for a hook that manages the password reset process. */
export interface UseResetPasswordReturn {
  /**
   * Initiates the password reset process for the given identifier.
   *
   * This sends a verification code (e.g., via email or SMS) to the provided identifier.
   *
   * @param params - Parameters required to start the password reset process.
   * @param params.identifier - The user's identifier (email address or phone number).
   *
   * @returns A Promise resolving to a result object:
   * - On success: `BaseSuccessReturn` with sign-in context via `WithSignInReturn`.
   * - On failure: `BaseFailureReturn` with possible error information.
   */
  startResetPassword: (params: {
    identifier: string;
  }) => Promise<(BaseSuccessReturn | BaseFailureReturn) & WithSignInReturn>;

  /**
   * Completes the password reset process using the provided verification code and new password.
   *
   * @param params - Parameters required to reset the password.
   * @param params.code - The verification code sent to the user.
   * @param params.password - The new password to be set.
   * @param params.tokenTemplate - (Optional) A token template name to use when creating the session token.
   *
   * @returns A Promise resolving to an `AuthorizationFinishedReturn`, which includes:
   * - `isSuccess`: Indicates whether the password reset was successful.
   * - `sessionToken`: A session token if authentication is completed.
   * - `signIn` and/or `signUp`: Additional context, depending on flow state.
   */
  resetPassword: (params: {
    code: string;
    password: string;
    tokenTemplate?: string;
  }) => Promise<AuthorizationFinishedReturn>;

  /** Indicates whether the password reset operation is currently in progress. `true` or `false` */
  isResetting: boolean;

  /** Indicates whether the code for password reset is currently being sent. `true` or `false` */
  isCodeSending: boolean;
}

// #endregion
