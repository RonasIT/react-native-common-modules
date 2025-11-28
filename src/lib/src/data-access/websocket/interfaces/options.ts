import type { Pusher } from '@pusher/pusher-websocket-react-native';

/**
 * @interface WebSocketOptions
 *
 * Constructor options for {@link WebSocketService}.
 */
export interface WebSocketOptions {
  /** Your **APP_KEY** from the Pusher Channels dashboard. */
  apiKey: string;
  /** Your **APP_CLUSTER**. */
  cluster: string;
  /** Whether to use secure WebSocket transport (default: `true`). */
  useTLS?: boolean;
  /** Time in **ms** before sending a ping when no messages have been sent. Default value is `30000`. */
  activityTimeout?: number;
  /** Time in **ms** to wait for the pong response. */
  pongTimeout?: number;
  /** Endpoint that returns the auth signature for *private* channels. */
  authURL?: string;
  /** Time in **seconds** to wait for the authorizer response. Default value is `60`. */
  authorizerTimeoutInSeconds?: number;
}

export type WebSocketHandlers = Omit<Parameters<Pusher['init']>[0], keyof WebSocketOptions | 'authEndpoint' | 'maxReconnectionAttempts'
  | 'maxReconnectGapInSeconds' |
  'proxy'>;

// NOTE: Pusher doesn't have a type for this
export type WebSocketConnectionState =
  | 'CONNECTING' // Currently attempting to establish a connection
  | 'CONNECTED' // Connection successfully established
  | 'DISCONNECTING' // Connection is about to be disconnected.
  | 'DISCONNECTED' // Connection has been disconnected with no attempts to automatically reconnect.
  | 'RECONNECTING' // Atempting to re-establish the connection.
