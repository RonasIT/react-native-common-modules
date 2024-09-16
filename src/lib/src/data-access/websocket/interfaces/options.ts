export interface WebSocketOptions {
  apiKey: string;
  cluster: string;
  useTLS?: boolean;
  activityTimeout?: number;
  pongTimeout?: number;
  authURL?: string;
}
