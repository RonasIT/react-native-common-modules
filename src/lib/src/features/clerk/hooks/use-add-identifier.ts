import { isClerkAPIResponseError, useUser } from '@clerk/clerk-expo';
import { EmailAddressResource, PhoneNumberResource } from '@clerk/types';
import { useState } from 'react';
import { ClerkApiError } from '../enums';
import { IdentifierType, UseAddIdentifierReturn } from '../types';

/**
 * Hook that provides functionality to add new email or phone number identifiers to a user's account and verify them using verification codes.
 *
 * @param {IdentifierType} type - Specifies the type of identifier (e.g., 'phone', 'email')
 *
 * @returns {UseAddIdentifierReturn} Object containing:
 * - `createIdentifier` - A function to add a new email or phone number identifier to the user's account and prepare it for verification
 * - `verifyCode` - A function to verify a code sent to the identifier, completing the verification process
 * - `isCreating` - A boolean indicating whether an identifier is currently being added
 * - `isVerifying` - A boolean indicating whether a verification code is currently being processed
 */
export function useAddIdentifier(type: IdentifierType): UseAddIdentifierReturn {
  const { user } = useUser();
  const [identifierResource, setIdentifierResource] = useState<PhoneNumberResource | EmailAddressResource>();
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isEmail = type === 'email';

  const createIdentifier: UseAddIdentifierReturn['createIdentifier'] = async ({ identifier }) => {
    setIsCreating(true);

    try {
      isEmail
        ? await user?.createEmailAddress({ email: identifier })
        : await user?.createPhoneNumber({ phoneNumber: identifier });

      await user?.reload();

      await prepareVerification({ identifier, isEmail });

      return { isSuccess: true, user };
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        const error = e.errors[0];

        if (error?.code === ClerkApiError.FORM_IDENTIFIER_EXIST && !getIdentifierVerified({ identifier, isEmail })) {
          await prepareVerification({ identifier, isEmail });

          await user?.reload();

          return { isSuccess: true, user };
        } else {
          return { error: e, user };
        }
      }

      return { user, isSuccess: false };
    } finally {
      setIsCreating(false);
    }
  };

  const verifyCode: UseAddIdentifierReturn['verifyCode'] = async ({ code }) => {
    setIsVerifying(true);

    try {
      const verifyAttempt = await identifierResource?.attemptVerification({ code });

      if (verifyAttempt?.verification?.status === 'verified') {
        return { isSuccess: true, user };
      } else {
        return { isSuccess: false, verifyAttempt };
      }
    } catch (error) {
      return { error, user };
    } finally {
      setIsVerifying(false);
    }
  };

  const prepareVerification = async ({ isEmail, identifier }: { identifier: string; isEmail: boolean }) => {
    const phoneResource = user?.phoneNumbers?.find((a) => a.phoneNumber === identifier);
    const emailResource = user?.emailAddresses?.find((a) => a.emailAddress === identifier);

    await (isEmail
      ? emailResource?.prepareVerification({ strategy: 'email_code' })
      : phoneResource?.prepareVerification());
    setIdentifierResource(isEmail ? emailResource : phoneResource);
  };

  const getIdentifierVerified = ({ identifier, isEmail }: { identifier: string; isEmail: boolean }): boolean => {
    const identifierResource = isEmail
      ? user?.emailAddresses?.find((a) => a.emailAddress === identifier)
      : user?.phoneNumbers?.find((a) => a.phoneNumber === identifier);

    return identifierResource?.verification?.status === 'verified';
  };

  return { createIdentifier, verifyCode, isCreating, isVerifying };
}
