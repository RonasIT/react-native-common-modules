import * as Notifications from 'expo-notifications';
import { useNavigationContainerRef, useRootNavigationState } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { ObtainPushNotificationsTokenArgs, pushNotificationsService } from '../service';

export interface UsePushNotificationsArgs extends ObtainPushNotificationsTokenArgs {
  subscribeDevice: ({ expoToken }: { expoToken: string }) => void;
  isAuthenticated: boolean;
  onNotificationResponse?: (notification: Notifications.Notification) => void;
}

export const usePushNotifications = ({
  subscribeDevice,
  isAuthenticated,
  getTokenErrorHandler,
  wrongDeviceErrorHandler,
  onNotificationResponse,
}: UsePushNotificationsArgs): void => {
  const [pushToken, setPushToken] = useState(pushNotificationsService.pushToken);
  const navigationRef = useNavigationContainerRef();
  const rootNavigationState = useRootNavigationState();
  const isNavigationReady = !!rootNavigationState?.key;
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const isPermissionFetching = useRef(false);

  const handleNotification = (notification: Notifications.Notification) =>
    navigationRef?.current?.isReady() && onNotificationResponse?.(notification);

  const setPushNotificationsToken = async () => {
    const token = await pushNotificationsService.obtainPushNotificationsToken({
      getTokenErrorHandler,
      wrongDeviceErrorHandler,
    });
    token && setPushToken(token);
  };

  useEffect(() => {
    if (isAuthenticated && navigationRef?.current?.isReady()) {
      setPushNotificationsToken();
    }
  }, [isAuthenticated, navigationRef?.current?.isReady()]);

  useEffect(() => {
    // NOTE: Workaround https://github.com/facebook/react-native/issues/30206#issuecomment-1698972226
    const handlerAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !isPermissionFetching.current) {
        isPermissionFetching.current = true;
        await setPushNotificationsToken();
        isPermissionFetching.current = false;
      }
    };

    const subscription = !pushToken && isAuthenticated && AppState.addEventListener('change', handlerAppStateChange);

    return () => {
      subscription && subscription.remove();
    };
  }, [pushToken, isAuthenticated]);

  useEffect(() => {
    pushToken && subscribeDevice({ expoToken: pushToken });
  }, [pushToken]);

  useEffect(() => {
    if (isNavigationReady && isAuthenticated && lastNotificationResponse?.notification) {
      handleNotification(lastNotificationResponse.notification);
    }
  }, [lastNotificationResponse, isNavigationReady, isAuthenticated]);
};
