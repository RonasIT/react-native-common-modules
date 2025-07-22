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

/**
 * Arguments accepted by {@link usePushNotifications}.
 *
 * This type extends {@link ObtainPushNotificationsTokenArgs}.
 */
export type UsePushNotificationsArgs = ObtainPushNotificationsTokenArgs & {
  /** Flag, that indicates whether the user is authenticated or not. */
  isAuthenticated: boolean;
  /** Callback when a notification is interacted with. */
  onNotificationResponse?: (notification: Notifications.Notification) => void;
  /** API error handler for subscribe/unsubscribe functions. */
  apiErrorHandler?: (response: Response) => void;
} & (
    | {
        /** Custom function for subscribing the device. */
        subscribeDevice: ({ expoToken }: { expoToken: string }) => Promise<Response>;
        /** Custom function for unsubscribing the device. */
        unsubscribeDevice: ({ expoToken }: { expoToken: string }) => Promise<Response>;
        /** API configuration should not be provided when custom functions are used. */
        apiConfig?: undefined;
      }
    | {
        /** API configuration for subscribing and unsubscribing the device */
        apiConfig: ApiConfig;
        /** Custom subscribe function should not be provided when API config is used. */
        subscribeDevice?: undefined;
        /** Custom unsubscribe function should not be provided when API config is used. */
        unsubscribeDevice?: undefined;
      }
  );

/**
 * **usePushNotifications**
 *
 * Hook, that automatically subscribes the device to receive push notifications when a user becomes authenticated,
 * and unsubscribes when a user becomes non-authenticated.
 * It supports custom subscription and unsubscription logic through provided functions or API configuration.
 * Listens for [responses](https://docs.expo.dev/push-notifications/receiving-notifications/) to notifications and executes a callback, if provided, when a notification is interacted with.
 * Used in the root App component.
 *
 * @param {UsePushNotificationsArgs} args Configuration object. See {@link UsePushNotificationsArgs} for a full description of each field.
 * @returns {void}
 */
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
          body: JSON.stringify({ expo_token: expoToken }),
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
          body: JSON.stringify({ expo_token: expoToken }),
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

  const handleNotification = (notification: Notifications.Notification): void => {
    isNavigationReady && onNotificationResponse?.(notification);
  };

  useEffect(() => {
    if (isAuthenticated && isRootNavigationStateReady && lastNotificationResponse?.notification) {
      handleNotification(lastNotificationResponse.notification);
    }
  }, [lastNotificationResponse, isRootNavigationStateReady, isAuthenticated]);
};
