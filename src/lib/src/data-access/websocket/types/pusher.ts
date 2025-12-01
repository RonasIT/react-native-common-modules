import { Pusher, PusherEvent } from '@pusher/pusher-websocket-react-native';
import { WebSocketOptions } from '../interfaces/options';

/**
 * Listener signature used across the WebSocket layer.
 *
 * @param event Raw {@link PusherEvent}
 */
export type WebSocketListener = (event: PusherEvent) => void;

export type WebSocketHandlers = Omit<
  Parameters<Pusher['init']>[0],
  keyof WebSocketOptions | 'authEndpoint' | 'maxReconnectionAttempts' | 'maxReconnectGapInSeconds' | 'proxy'
>;

// NOTE: Pusher doesn't have a type for this
export type WebSocketConnectionState =
  | 'CONNECTING' // Currently attempting to establish a connection
  | 'CONNECTED' // Connection successfully established
  | 'DISCONNECTING' // Connection is about to be disconnected.
  | 'DISCONNECTED' // Connection has been disconnected with no attempts to automatically reconnect.
  | 'RECONNECTING'; // Atempting to re-establish the connection.
