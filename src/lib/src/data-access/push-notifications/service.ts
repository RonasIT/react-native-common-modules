import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PermissionStatus } from './enums';

export interface ObtainPushNotificationsTokenArgs {
  getTokenErrorHandler: () => void;
  wrongDeviceErrorHandler?: () => void;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
    wrongDeviceErrorHandler,
  }: ObtainPushNotificationsTokenArgs): Promise<string | undefined> {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const existingPermissionsStatus = await this.getExistingPermissions();

      if (existingPermissionsStatus !== PermissionStatus.GRANTED) {
        const permissionsStatus = await this.requestPermissions();

        if (permissionsStatus !== PermissionStatus.GRANTED) {
          getTokenErrorHandler?.();

          return;
        }
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });

      this._pushToken = token.data;

      return token.data;
    } else {
      wrongDeviceErrorHandler?.();

      return;
    }
  }
}

export const pushNotificationsService = new PushNotificationsService();
