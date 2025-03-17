import * as ImagePicker from 'expo-image-picker';
import { ImagePickerSource, ImagePickerError } from './enums';
import { Alert, Linking } from 'react-native';

export class ImagePickerService {
  public defaultOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: 'images',
    allowsEditing: true,
    base64: true,
    quality: 0.3,
  };

  public getFormData(uri: string, name?: string): FormData {
    const formData = new FormData();
    const match = /\.(\w+)$/.exec(uri);
    const type = match ? `image/${match[1]}` : 'image';
    formData.append(name || 'file', { uri, type, name: match?.[1] } as any);

    return formData;
  }

  public getImage(source: ImagePickerSource, onPermissionDenied?: () => void): Promise<ImagePicker.ImagePickerResult | ImagePickerError> {
    return this.pickImage(source, onPermissionDenied);
  }

  public requestGalleryAccess(): Promise<ImagePicker.PermissionResponse> {
    return ImagePicker.requestMediaLibraryPermissionsAsync();
  }

  public launchGallery(options?: ImagePicker.ImagePickerOptions): Promise<ImagePicker.ImagePickerResult> {
    return ImagePicker.launchImageLibraryAsync({ ...this.defaultOptions, ...options });
  }

  public requestCameraAccess(): Promise<ImagePicker.PermissionResponse> {
    return ImagePicker.requestCameraPermissionsAsync();
  }

  public launchCamera(options?: ImagePicker.ImagePickerOptions): Promise<ImagePicker.ImagePickerResult> {
    return ImagePicker.launchCameraAsync({ ...this.defaultOptions, ...options });
  }

  private async pickImage(source: ImagePickerSource, onPermissionDenied?: () => void): Promise<ImagePicker.ImagePickerResult | ImagePickerError> {
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

export const imagePickerService = new ImagePickerService();
