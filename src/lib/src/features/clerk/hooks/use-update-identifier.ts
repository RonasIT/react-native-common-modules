import { useUser } from '@clerk/clerk-expo';
import { EmailAddressResource, PhoneNumberResource } from '@clerk/types';
import { useRef, useState } from 'react';
import { IdentifierType, UseUpdateIdentifierReturn } from '../types';
import { useAddIdentifier } from './use-add-identifier';

/**
 * Hook that provides functionality to update an existing primary identifier
 * (email address or phone number) for the current user.
 *
 * This hook is a higher-level abstraction built on top of `useAddIdentifier`.
 * It reuses the identifier creation and verification flow, but extends it with
 * additional logic that, upon successful verification, automatically:
 *
 * - Sets the newly verified identifier as the primary one
 * - Removes the previously primary identifier (if different)
 *
 * The update process follows these stages:
 * 1. `createIdentifier` — adds a new identifier and initiates its verification flow
 * 2. `verifyCode` — verifies the received code and, if successful, updates the
 *    user's primary identifier
 *
 * All method signatures and return types are inherited from
 * `useUpdateIdentifier`, ensuring full compatibility with `useAddIdentifier`.
 *
 * @param {IdentifierType} type - Specifies the type of identifier (e.g., 'phone', 'email')
 *
 * @returns {UseUpdateIdentifierReturn} Object containing:
 * - `createIdentifier` — Adds a new email or phone identifier and prepares it for verification
 * - `verifyCode` — Verifies the code sent to the identifier and, on success,
 *   updates the user's primary identifier
 * - `isCreating` — Indicates whether an identifier is currently being added
 * - `isVerifying` — Indicates whether a verification request is currently being processed
 * - `isUpdating` — Indicates whether the primary identifier update is currently in progress
 */
export function useUpdateIdentifier(type: IdentifierType): UseUpdateIdentifierReturn {
  const { user } = useUser();
  const isEmail = type === 'email';

  const {
    createIdentifier: addIdentifier,
    verifyCode: verifyAddIdentifierCode,
    isCreating,
    isVerifying,
  } = useAddIdentifier(type);

  const pendingIdentifier = useRef<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const getIdentifierResource = (): EmailAddressResource | PhoneNumberResource | undefined => {
    if (!pendingIdentifier.current) return;

    return isEmail
      ? user?.emailAddresses?.find((a) => a.emailAddress === pendingIdentifier.current)
      : user?.phoneNumbers?.find((a) => a.phoneNumber === pendingIdentifier.current);
  };

  const swapPrimaryIdentifier = async () => {
    const newResource = getIdentifierResource();

    if (!newResource || newResource.verification?.status !== 'verified') {
      throw new Error('Identifier not found or not verified');
    }

    const currentPrimaryId = isEmail ? user?.primaryEmailAddressId : user?.primaryPhoneNumberId;

    const resources = isEmail ? user?.emailAddresses : user?.phoneNumbers;
    const oldPrimaryResource = resources?.find((r) => r.id === currentPrimaryId);

    if (isEmail) {
      await user?.update({ primaryEmailAddressId: newResource.id });
    } else {
      await user?.update({ primaryPhoneNumberId: newResource.id });
    }

    if (oldPrimaryResource && oldPrimaryResource.id !== newResource.id) {
      await oldPrimaryResource.destroy();
    }

    await user?.reload();
  };

  const createIdentifier: UseUpdateIdentifierReturn['createIdentifier'] = async ({ identifier }) => {
    pendingIdentifier.current = identifier;

    return addIdentifier({ identifier });
  };

  const verifyCode: UseUpdateIdentifierReturn['verifyCode'] = async ({ code }) => {
    setIsUpdating(true);

    const result = await verifyAddIdentifierCode({ code });

    // Important to reload user model after adding new fields
    await user?.reload();

    if (!result.isSuccess) {
      setIsUpdating(false);

      return result;
    }

    try {
      await swapPrimaryIdentifier();

      return { isSuccess: true, user };
    } catch (error) {
      return { isSuccess: false, error, user };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    createIdentifier,
    verifyCode,
    isCreating,
    isVerifying,
    isUpdating,
  } satisfies UseUpdateIdentifierReturn;
}
