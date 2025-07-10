import { PusherEvent } from '@pusher/pusher-websocket-react-native';

/**
 * Listener signature used across the WebSocket layer.
 *
 * @param event Raw {@link PusherEvent}
 */
export type WebSocketListener = (event: PusherEvent) => void;
