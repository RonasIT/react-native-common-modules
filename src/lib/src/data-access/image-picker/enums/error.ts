/**
 * Enum representing possible errors from ImagePickerService.
 *
 * - PERMISSION_DENIED: The user has permanently denied the permission.
 * - UNAVAILABLE: The permission is not yet granted but can still be requested.
 *
 * @enum
 */
export enum ImagePickerError {
  /** The user has permanently denied permission and it cannot be requested again. */
  PERMISSION_DENIED = 'denied',
  /** Permission is currently unavailable but may still be requested later. */
  UNAVAILABLE = 'unavailable',
}
