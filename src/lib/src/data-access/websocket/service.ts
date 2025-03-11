import { Pusher, PusherEvent } from '@pusher/pusher-websocket-react-native';
import { BaseWebSocketService } from './base-service';
import { WebSocketListener } from './types';
import { WebSocketOptions } from './interfaces';
import { omit } from 'lodash-es';

export class WebSocketService<TChannelName extends string> extends BaseWebSocketService<TChannelName> {
  private readonly pusher: Pusher;

  constructor(options: WebSocketOptions) {
    super(options);
    this.pusher = Pusher.getInstance();
  }

  public async connect(authToken?: string): Promise<void> {
    const activityTimeout = this.options.activityTimeout;
    const pongTimeout = this.options.pongTimeout;

    await this.pusher.init({
      ...omit(this.options, ['authURL', 'activityTimeout', 'pongTimeout']),
      // RN Pusher accepts timeouts in seconds
      activityTimeout: activityTimeout ? Math.round(activityTimeout) : undefined,
      pongTimeout: pongTimeout ? Math.round(pongTimeout) : undefined,
      onSubscriptionError: (channelName) =>  this.addEventHandlerToPusher(channelName as TChannelName),
      onAuthorizer: this.options.authURL ? async (channelName: string, socketID: string) => {
        return await this.authorize(channelName, socketID, authToken);
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
