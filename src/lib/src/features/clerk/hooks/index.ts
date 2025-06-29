import { useAuthWithSSO } from './use-auth-with-sso';
import { useAuthWithTicket } from './use-auth-with-ticket';
import { useClerkResources } from './use-clerk-resources';
import { useGetSessionToken } from './use-get-session-token';
import { useOtpVerification } from './use-otp-verification';

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
const { startAuthorization, isLoading } = useAuthWithTicket()
const { sendOtpCode, isVerifying, verifyCode} = useOtpVerification()