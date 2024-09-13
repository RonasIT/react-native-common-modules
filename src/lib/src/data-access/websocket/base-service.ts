import { without } from 'lodash';
import { WebSocketListener } from './types';
import { WebSocketChannels } from './interfaces';
import { WebsocketOptions } from './interfaces/options';

export abstract class BaseWebSocketService<TChannelName extends string> {
  protected channels: WebSocketChannels = {};
  protected options: WebsocketOptions;

  constructor(options: WebsocketOptions) {
    this.options = options;
  }

  public abstract connect(authToken: string | null): void;

  public subscribeToChannel(channelName: TChannelName, onEvent: WebSocketListener): void {
    this.channels[channelName] ? this.channels[channelName].push(onEvent) : (this.channels[channelName] = [onEvent]);
  }

  public unsubscribeFromChannel(channelName: TChannelName, onEvent: WebSocketListener): void {
    this.channels[channelName] = without(this.channels[channelName], onEvent);
    if (this.channels[channelName].length === 0) {
      delete this.channels[channelName];
    }
  }
}
