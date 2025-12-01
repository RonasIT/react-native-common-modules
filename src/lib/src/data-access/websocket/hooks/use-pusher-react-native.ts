import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { WebSocketService } from '../service';

export function usePusherReactNative(webSocketService: WebSocketService): void {
  // NOTE: Android can silently lose websocket connection when the app is put to background
  // Issue: https://github.com/pusher/pusher-websocket-react-native/issues/135
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        webSocketService.connect();
      } else {
        webSocketService.disconnect();
      }
    });

    return subscription.remove;
  }, []);
}
