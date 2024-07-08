import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PermissionStatus } from './enums';

export interface ObtainPushNotificationsTokenArgs {
  getTokenErrorHandler: () => void;
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

  private async getExistingPermissions(): Promise<PermissionStatus> {
    const { status } = await Notifications.getPermissionsAsync();

    return status;
  }

  private async requestPermissions(): Promise<PermissionStatus> {
    const { status } = await Notifications.requestPermissionsAsync();

    return status;
  }

  public get pushToken(): string | undefined {
    return this._pushToken;
  }

  public async obtainPushNotificationsToken({
    getTokenErrorHandler,
  }: ObtainPushNotificationsTokenArgs): Promise<string | undefined> {
    if (Device.isDevice) {
      const existingPermissionsStatus = await this.getExistingPermissions();

      if (existingPermissionsStatus !== PermissionStatus.GRANTED) {
        const permissionsStatus = await this.requestPermissions();

        if (permissionsStatus !== PermissionStatus.GRANTED) {
          getTokenErrorHandler?.();

          return;
        }
      }

      const projectId = Constants.expoConfig?.extra?.eas.projectId;
      if (!projectId) {
        console.error('projectId is not specified in eas config');
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
