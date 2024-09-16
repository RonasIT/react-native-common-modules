import Pusher, { ChannelAuthorizationCallback } from 'pusher-js';
import { BaseWebSocketService } from './base-service';
import { WebSocketListener } from './types';
import { ChannelAuthorizationRequestParams } from 'pusher-js/types/src/core/auth/options';

export class WebSocketService<TChannelName extends string> extends BaseWebSocketService<TChannelName> {
  private pusher?: Pusher;

  public connect(): void {
    const authOptions = this.options.auth;
    this.pusher = new Pusher(this.options.key, {
      cluster: this.options.cluster,
      channelAuthorization: authOptions ? {
        customHandler: async (
          { socketId, channelName }: ChannelAuthorizationRequestParams,
          callback: ChannelAuthorizationCallback
        ) => {
          const authData = await this.authorize(channelName, socketId);
          callback(null, authData);
        }
      } : undefined
    });
    this.pusher.connect();
  }

  public subscribeToChannel(channelName: TChannelName, onEvent: WebSocketListener): void {
    if (!this.pusher) {
      return;
    }

    super.subscribeToChannel(channelName, onEvent);
    this.pusher.subscribe(channelName)
      .bind('pusher:subscription_error', () => this.onSubscriptionError(channelName))
      .bind_global(this.getEventHandler(channelName));
  }

  public unsubscribeFromChannel(channelName: TChannelName, onEvent: WebSocketListener): void {
    if (!this.pusher) {
      return;
    }

    super.unsubscribeFromChannel(channelName, onEvent);

    if (!this.channels[channelName] || this.channels[channelName].length === 0) {
      this.pusher.unsubscribe(channelName);
    }
  }

  private onSubscriptionError(channelName: string) {
    this.pusher
      ?.subscribe(channelName)
      .bind_global(this.getEventHandler(channelName));
  }

  private getEventHandler(channelName: string) {
    return (eventName: string, data: any): void => {
      this.channels[channelName].forEach((listener) => listener({ channelName, eventName, data }));
    };
  }
}
