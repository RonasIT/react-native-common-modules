import { OtpMethod, UseAuthWithOtpReturn } from '../types';
import { useAuthWithEmailOtp } from './use-auth-with-email-otp';
import { useAuthWithPhoneOtp } from './use-auth-with-phone-otp';
import { useClerkResources } from './use-clerk-resources';

export function useAuthWithOtp(): UseAuthWithOtpReturn {
  const phoneMethods = useAuthWithPhoneOtp();
  const emailMethods = useAuthWithEmailOtp();
  const { signUp, signIn } = useClerkResources();
  const isLoading = phoneMethods.isLoading || emailMethods.isLoading;
  const isVerifying = phoneMethods.isVerifying || emailMethods.isVerifying;

  const sendOtpCode = async (): Promise<void> => {
    const method = getActiveOtpMethod();
    await (method === 'email' ? emailMethods : phoneMethods).sendOtpCode();
  };

  const startSignUp: UseAuthWithOtpReturn['startSignUp'] = async ({ identifier, method }) => method === 'email'
    ? emailMethods.startSignUp({ email: identifier })
    : phoneMethods.startSignUp({ phone: identifier });

  const startSignIn: UseAuthWithOtpReturn['startSignIn'] = async ({ identifier, method }) => method === 'email'
    ? emailMethods.startSignIn({ email: identifier })
    : phoneMethods.startSignIn({ phone: identifier });

  const startAuthorization: UseAuthWithOtpReturn['startAuthorization'] = async ({ identifier, method }) => method === 'email'
    ? emailMethods.startAuthorization({ email: identifier })
    : phoneMethods.startAuthorization({ phone: identifier });

  const verifyCode: UseAuthWithOtpReturn['verifyCode'] = async ({ code, tokenTemplate }) => {
    const method = getActiveOtpMethod();

    return (method === 'email' ? emailMethods : phoneMethods).verifyCode({ code, tokenTemplate });
  };

  const getActiveOtpMethod = (): OtpMethod => {
    const isSignInFlow = !!signIn?.id;

    if (isSignInFlow) {
      return signIn.identifier?.includes('@') ? 'email' : 'phone';
    }

    return signUp?.emailAddress ? 'email' : 'phone';
  };

  return {
    startSignIn,
    startSignUp,
    startAuthorization,
    sendOtpCode,
    verifyCode,
    isLoading,
    isVerifying
  };
}
