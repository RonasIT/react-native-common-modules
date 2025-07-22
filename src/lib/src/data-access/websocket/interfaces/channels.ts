import { WebSocketListener } from '../types';

/**
 * @interface WebSocketChannels
 *
 * Runtime map where each key is a channel name and the value is an array of listeners.
 */
export interface WebSocketChannels {
  [key: string]: Array<WebSocketListener>;
}
