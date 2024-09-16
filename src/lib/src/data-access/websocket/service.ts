import { Pusher, PusherEvent } from '@pusher/pusher-websocket-react-native';
import { BaseWebSocketService } from './base-service';
import { WebSocketListener } from './types';
import { WebSocketOptions } from './interfaces';
import { omit } from 'lodash';

export class WebSocketService<TChannelName extends string> extends BaseWebSocketService<TChannelName> {
  private readonly pusher: Pusher;

  constructor(options: WebSocketOptions) {
    super(options);
    this.pusher = Pusher.getInstance();
  }

  public async connect(): Promise<void> {
    const authOptions = this.options.auth;
    await this.pusher.init({
      ...omit(this.options, ['auth']),
      onSubscriptionError: (channelName) =>  this.addEventHandlerToPusher(channelName as TChannelName),
      onAuthorizer: authOptions ? async (channelName: string, socketID: string) => {
        return await this.authorize(channelName, socketID);
      } : undefined
    });
    this.pusher.connect();
  }

  public subscribeToChannel(channelName: TChannelName, onEvent: WebSocketListener): void {
    super.subscribeToChannel(channelName, onEvent);
    this.addEventHandlerToPusher(channelName);
  }

  public async unsubscribeFromChannel(channelName: TChannelName, onEvent: WebSocketListener): Promise<void> {
    super.unsubscribeFromChannel(channelName, onEvent);

    if (!this.channels[channelName] || this.channels[channelName].length === 0) {
      await this.pusher.unsubscribe({ channelName });
    }
  }

  private addEventHandlerToPusher(channelName: TChannelName) {
    const eventHandler = (event: PusherEvent): void => {
      this.channels[channelName].forEach((listener) => listener(event));
    };

    this.pusher.subscribe({
      channelName,
      onEvent: eventHandler,
    });
  }
}
