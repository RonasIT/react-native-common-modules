import { WebSocketOptions } from './interfaces';

export const defaultPusherOptions: Partial<WebSocketOptions> = {
  activityTimeout: 30 * 1000,
  pongTimeout: 30 * 1000,
  authorizerTimeoutInSeconds: 60,
};
