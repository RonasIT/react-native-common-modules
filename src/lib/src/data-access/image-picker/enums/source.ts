/**
 * Enum representing the source for picking an image.
 *
 * - CAMERA: Use the device's camera to take a new photo.
 * - GALLERY: Select an image from the device's media library.
 *
 * @enum
 */
export enum ImagePickerSource {
  /** Use the device's camera to capture a new image. */
  CAMERA = 'camera',
  /** Select an image from the device's image gallery. */
  GALLERY = 'gallery',
}
