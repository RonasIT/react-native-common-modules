import * as Notifications from 'expo-notifications';
import { useNavigationContainerRef, useRootNavigationState } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { ObtainPushNotificationsTokenArgs, pushNotificationsService } from '../service';

type ApiConfig = {
  accessToken: string;
  subscribeDeviceUrl: string;
  unsubscribeDeviceUrl: string;
  method?: 'GET' | 'get' | 'POST' | 'post';
};

export type UsePushNotificationsArgs = ObtainPushNotificationsTokenArgs & {
  isAuthenticated: boolean;
  onNotificationResponse?: (notification: Notifications.Notification) => void;
  apiErrorHandler?: (response: Response) => void;
} & (
    | {
        subscribeDevice: ({ expoToken }: { expoToken: string }) => Promise<Response>;
        unsubscribeDevice: ({ expoToken }: { expoToken: string }) => Promise<Response>;
        apiConfig?: undefined;
      }
    | {
        apiConfig: ApiConfig;
        subscribeDevice?: undefined;
        unsubscribeDevice?: undefined;
      }
  );

export const usePushNotifications = ({
  isAuthenticated,
  subscribeDevice,
  unsubscribeDevice,
  onNotificationResponse,
  apiConfig,
  apiErrorHandler,
  getTokenErrorHandler,
}: UsePushNotificationsArgs): void => {
  const [pushToken, setPushToken] = useState(pushNotificationsService.pushToken);

  const navigationRef = useNavigationContainerRef();
  const rootNavigationState = useRootNavigationState();
  const isNavigationReady = navigationRef?.current?.isReady();
  const isRootNavigationStateReady = !!rootNavigationState?.key;

  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const isPermissionFetching = useRef(false);

  const subscribeDeviceCallback: typeof subscribeDevice = subscribeDevice
    ? subscribeDevice
    : ({ expoToken }) =>
        fetch(apiConfig.subscribeDeviceUrl, {
          method: apiConfig.method || 'POST',
          headers: {
            Authorization: `Bearer ${apiConfig.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ expoToken }),
        });

  const unsubscribeDeviceCallback: typeof unsubscribeDevice = unsubscribeDevice
    ? unsubscribeDevice
    : ({ expoToken }) =>
        fetch(apiConfig.unsubscribeDeviceUrl, {
          method: apiConfig.method || 'POST',
          headers: {
            Authorization: `Bearer ${apiConfig.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ expoToken }),
        });

  useEffect(() => {
    if (pushToken && isAuthenticated) {
      subscribeDeviceCallback?.({ expoToken: pushToken }).catch(apiErrorHandler);
    }
  }, [pushToken, isAuthenticated]);

  useEffect(() => {
    if (pushToken && !isAuthenticated) {
      unsubscribeDeviceCallback?.({ expoToken: pushToken })
        .catch(apiErrorHandler)
        .finally(() => setPushToken(undefined));
    }
  }, [pushToken, isAuthenticated]);

  const setPushNotificationsToken = async (): Promise<void> => {
    const token = await pushNotificationsService.obtainPushNotificationsToken({ getTokenErrorHandler });
    token && setPushToken(token);
  };

  useEffect(() => {
    if (isNavigationReady && isAuthenticated) {
      setPushNotificationsToken();
    }
  }, [isAuthenticated, isNavigationReady]);

  useEffect(() => {
    // NOTE: Workaround https://github.com/facebook/react-native/issues/30206#issuecomment-1698972226
    const handlerAppStateChange = async (nextAppState: AppStateStatus): Promise<void> => {
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

  const handleNotification = (notification: Notifications.Notification): void  => {
    isNavigationReady && onNotificationResponse?.(notification);
  }

  useEffect(() => {
    if (isAuthenticated && isRootNavigationStateReady && lastNotificationResponse?.notification) {
      handleNotification(lastNotificationResponse.notification);
    }
  }, [lastNotificationResponse, isRootNavigationStateReady, isAuthenticated]);
};
