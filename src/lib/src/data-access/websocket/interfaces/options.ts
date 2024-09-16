export interface WebSocketOptions {
  apiKey: string;
  cluster: string;
  useTLS?: boolean;
  activityTimeout?: number; // in ms
  pongTimeout?: number; // in ms
  authURL?: string;
}
