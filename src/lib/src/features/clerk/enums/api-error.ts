/**
 * Enum containing common Clerk API error codes
 */
export enum ClerkApiError {
  /** Error when a session already exists */
  SESSION_EXISTS = 'session_exists',
  /** Error when an identifier (email/phone) already exists */
  FORM_IDENTIFIER_EXIST = 'form_identifier_exists',
  /** Error when the verification code is incorrect */
  FORM_CODE_INCORRECT = 'form_code_incorrect',
};
