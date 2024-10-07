import { WebSocketListener } from '../types';

export interface WebSocketChannels {
  [key: string]: Array<WebSocketListener>;
}
