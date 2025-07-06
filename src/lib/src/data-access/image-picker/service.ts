import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';
import { ImagePickerSource, ImagePickerError } from './enums';

/**
 * Gives the application access to the **camera** and **image gallery**.
 *
 * > Requires the `expo-image-picker`.
 *
 * @returns {ImagePickerService} Service instance exposing:
 * - `getImage` –  initializes the application (camera or gallery) and returns a result containing an image
 * - `launchGallery` – launches the gallery application and returns a result containing the selected images
 * - `launchCamera` – launches the camera application and returns the taken photo
 * - `requestGalleryAccess` – requests the application access to the gallery
 * - `requestCameraAccess` – requests the application access to the camera
 * - `getFormData` – creates a [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object with image.
 */
export class ImagePickerService {
  /** Default options applied to every picker call unless overridden. */
  public defaultOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: 'images',
    allowsEditing: true,
    base64: true,
    quality: 0.3,
  };

  /**
   * Build a [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object containing the image located at `uri`.
   *
   * @param {string} uri  Local file URI (e.g. `file:///path/to/image.jpg`).
   * @param {string} [name="file"] Optional form field name.
   * @returns {FormData} [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) ready to be sent via `multipart/form-data`.
   */
  public getFormData(uri: string, name?: string): FormData {
    const formData = new FormData();
    const match = /\.(\w+)$/.exec(uri);
    const type = match ? `image/${match[1]}` : 'image';
    formData.append(name || 'file', { uri, type, name: match?.[1] } as any);

    return formData;
  }

  /**
   * Opens the camera or image gallery based on the provided source.
   * Handles all required permission checks internally.
   *
   * @param {ImagePickerSource} source - The image source. See {@link ImagePickerSource}.
   * @param {() => void} [onPermissionDenied] - Optional callback called when permissions are permanently denied.
   * @returns {Promise<ImagePicker.ImagePickerResult | ImagePickerError>} Resolves with the picker result or error. See {@link ImagePickerError}.
   */
  public getImage(
    source: ImagePickerSource,
    onPermissionDenied?: () => void,
  ): Promise<ImagePicker.ImagePickerResult | ImagePickerError> {
    return this.pickImage(source, onPermissionDenied);
  }

  /**
   * Request **read access** to the device’s media library.
   *
   * @returns {Promise<ImagePicker.PermissionResponse>} Permission response.
   */
  public requestGalleryAccess(): Promise<ImagePicker.PermissionResponse> {
    return ImagePicker.requestMediaLibraryPermissionsAsync();
  }

  /**
   * Open the **gallery** UI.
   *
   * @param {ImagePicker.ImagePickerOptions} [options] Additional picker options merged with {@link defaultOptions}.
   * @returns {Promise<ImagePicker.ImagePickerResult>} Picker result.
   */
  public launchGallery(options?: ImagePicker.ImagePickerOptions): Promise<ImagePicker.ImagePickerResult> {
    return ImagePicker.launchImageLibraryAsync({ ...this.defaultOptions, ...options });
  }

  /**
   * Request **camera** permission.
   *
   * @returns {Promise<ImagePicker.PermissionResponse>} Permission response.
   */
  public requestCameraAccess(): Promise<ImagePicker.PermissionResponse> {
    return ImagePicker.requestCameraPermissionsAsync();
  }

  /**
   * Open the **camera** UI.
   *
   * @param {ImagePicker.ImagePickerOptions} [options] Additional picker options merged with {@link defaultOptions}.
   * @returns {Promise<ImagePicker.ImagePickerResult>} Picker result.
   */
  public launchCamera(options?: ImagePicker.ImagePickerOptions): Promise<ImagePicker.ImagePickerResult> {
    return ImagePicker.launchCameraAsync({ ...this.defaultOptions, ...options });
  }

  /**
   * Internal helper that performs permission checks and calls {@link launchCamera} or {@link launchGallery}.
   *
   * @internal
   */
  private async pickImage(
    source: ImagePickerSource,
    onPermissionDenied?: () => void,
  ): Promise<ImagePicker.ImagePickerResult | ImagePickerError> {
    const isCamera = source === ImagePickerSource.CAMERA;
    const response = isCamera ? await this.requestCameraAccess() : await this.requestGalleryAccess();

    const handlePermissionDeniedResponse = (): void => {
      if (onPermissionDenied) {
        onPermissionDenied();

        return;
      }

      const permissionSubject = isCamera ? 'camera' : 'gallery';
      const errorMessage = `Sorry, we need ${permissionSubject} permissions to make this work! Please enable ${permissionSubject} permissions in your device settings`;

      Alert.alert('', errorMessage, [{ text: 'Close' }, { onPress: Linking.openSettings, text: 'Open settings' }]);
    };

    if (!response.canAskAgain) {
      handlePermissionDeniedResponse();

      return ImagePickerError.PERMISSION_DENIED;
    }

    if (response.status !== ImagePicker.PermissionStatus.GRANTED) {
      return ImagePickerError.UNAVAILABLE;
    }

    return isCamera ? this.launchCamera() : this.launchGallery();
  }
}

/**
 * Ready‑to‑use singleton instance.
 */
export const imagePickerService = new ImagePickerService();
