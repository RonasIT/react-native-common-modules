export interface WebSocketOptions {
  key: string;
  cluster: string;
  auth?: {
    url: string;
    token: string
  }
}
