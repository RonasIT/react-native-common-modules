/**
 * Constructor options for {@link WebSocketService}.
 *
 * **Required**
 * - `apiKey` – Your **APP_KEY** from the Pusher Channels dashboard.
 * - `cluster` – Your **APP_CLUSTER**.
 *
 * **Optional**
 * - `authURL` – Endpoint that returns the auth signature for *private* channels.
 * - `useTLS` – Whether to use secure WebSocket transport (default: `true`).
 * - `activityTimeout` – Time in **ms** before sending a ping when no messages have been sent.
 * - `pongTimeout` – Time in **ms** to wait for the pong response.
 */
export interface WebSocketOptions {
  apiKey: string;
  cluster: string;
  useTLS?: boolean;
  activityTimeout?: number; // in ms
  pongTimeout?: number; // in ms
  authURL?: string;
}
