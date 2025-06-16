import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { PermissionStatus } from 'expo-modules-core';
import { Alert, Linking, Platform } from 'react-native';

export interface ObtainPushNotificationsTokenArgs {
  getTokenErrorHandler?: (permissionResponse: Notifications.PermissionResponse) => void;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

class PushNotificationsService {
  private _pushToken?: string;

  public get pushToken(): string | undefined {
    return this._pushToken;
  }

  public async obtainPushNotificationsToken({
    getTokenErrorHandler,
  }: ObtainPushNotificationsTokenArgs): Promise<string | undefined> {
    if (Device.isDevice) {
      const settings = await Notifications.getPermissionsAsync();

      const handlePermissionDeniedResponse = (response: Notifications.NotificationPermissionsStatus): void => {
        if (getTokenErrorHandler) {
          getTokenErrorHandler(response);
        } else {
          const errorMessage = `Sorry, we need notification permissions to make this work! Please enable notification permissions in your device settings`;

          Alert.alert('', errorMessage, [{ text: 'Close' }, { onPress: Linking.openSettings, text: 'Open settings' }]);
        }
      };

      const requestPermissionsIOS = async (
        settings: Notifications.NotificationPermissionsStatus
      ): Promise<void> => {
        const permissionsGrantedStatuses = [
          Notifications.IosAuthorizationStatus.AUTHORIZED,
          Notifications.IosAuthorizationStatus.PROVISIONAL,
          Notifications.IosAuthorizationStatus.EPHEMERAL
        ];
  
        if (settings.ios?.status === Notifications.IosAuthorizationStatus.NOT_DETERMINED) {
          const permissions = await Notifications.requestPermissionsAsync();
          const arePermissionsGranted = !!permissions.ios && permissionsGrantedStatuses.includes(permissions.ios?.status);

          if (!arePermissionsGranted) {
            handlePermissionDeniedResponse(permissions);
          }

          return;
        }
  
        const arePermissionsGranted = !!settings.ios && permissionsGrantedStatuses.includes(settings.ios?.status);

        if (!arePermissionsGranted) {
          handlePermissionDeniedResponse(settings);
        }
      };
  
      const requestPermissionsAndroid = async (
        settings: Notifications.NotificationPermissionsStatus
      ): Promise<void> => {
        if (settings.status !== PermissionStatus.GRANTED) {
          const permissions = await Notifications.requestPermissionsAsync();
          const arePermissionsGranted = permissions.status === PermissionStatus.GRANTED;

          if (!arePermissionsGranted) {
            handlePermissionDeniedResponse(permissions);
          }

          return;
        }
  
        const arePermissionsGranted = settings.status === PermissionStatus.GRANTED;

        if (!arePermissionsGranted) {
          handlePermissionDeniedResponse(settings);
        }
      };

      if (Platform.OS === 'ios') {
        await requestPermissionsIOS(settings);
      }

      if (Platform.OS === 'android') {
        await requestPermissionsAndroid(settings);
      }

      const projectId = Constants.expoConfig?.extra?.eas.projectId;

      if (!projectId) {
        console.error('EAS projectId is not specified in app.config.ts. Push notifications may not work.');
      }

      const token = await Notifications.getExpoPushTokenAsync({ projectId });

      this._pushToken = token.data;

      return token.data;
    } else {
      console.error('Must use physical device for push notifications');

      return;
    }
  }
}

export const pushNotificationsService = new PushNotificationsService();
