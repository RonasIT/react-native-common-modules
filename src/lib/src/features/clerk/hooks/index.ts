import { useAddIdentifier } from './use-add-identifier';
import { useAuthWithIdentifier } from './use-auth-with-identifier';
import { useAuthWithSSO } from './use-auth-with-sso';
import { useAuthWithTicket } from './use-auth-with-ticket';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-session-token';
import { useOtpVerification } from './use-otp-verification';
import { useResetPassword } from './use-reset-password';

export * from './use-clerk-resources';
export * from './use-get-session-token';
export * from './use-auth-with-sso';
export * from './use-auth-with-ticket';
export * from './use-otp-verification';
export * from './use-auth-with-identifier';
export * from './use-add-identifier';
export * from './use-reset-password';


const { signUp, signIn, setActive, signOut } = useClerkResources()
const { getSessionToken } = useGetSessionToken()
const { startSSOFlow, isLoading: isLoadingSSO } = useAuthWithSSO()
// const { startAuthorization, isLoading } = useAuthWithTicket()
// const { verifyCode} = useOtpVerification()
// const { startAuthorization, startSignIn, startSignUp, isLoading, isVerifying } = useAuthWithIdentifier('emailAddress', 'otp')
// const { isCreating, isVerifying, createIdentifier, verifyCode } = useAddIdentifier()
const t = useResetPassword({method: 'emailAddress'})