import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { PermissionStatus } from 'expo-modules-core';
import { Platform } from 'react-native';

export interface ObtainPushNotificationsTokenArgs {
  getTokenErrorHandler?: (permissionResponse: Notifications.PermissionResponse) => void;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
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
      const { status: existingPermissionsStatus } = await Notifications.getPermissionsAsync();

      if (existingPermissionsStatus !== PermissionStatus.GRANTED) {
        const response = await Notifications.requestPermissionsAsync();

        if (response.status !== PermissionStatus.GRANTED) {
          getTokenErrorHandler?.(response) ||
            console.warn(
              'Failed to obtain push notifications token.\nPlease specify the "getTokenErrorHandler" callback in the usePushNotifications hook to clear this warning'
            );

          return;
        }
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
