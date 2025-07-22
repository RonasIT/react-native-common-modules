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
  /** Time in **ms** before sending a ping when no messages have been sent. */
  activityTimeout?: number;
  /** Time in **ms** to wait for the pong response. */
  pongTimeout?: number;
  /** Endpoint that returns the auth signature for *private* channels. */
  authURL?: string;
}
