export interface WebSocketOptions {
  apiKey: string;
  cluster: string;
  useTLS?: boolean;
  activityTimeout?: number;
  pongTimeout?: number;
  auth?: {
    url: string;
    token?: string
  }
}
