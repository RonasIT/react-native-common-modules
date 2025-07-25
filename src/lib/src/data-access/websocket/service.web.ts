import { omit } from 'lodash-es';
import Pusher, { ChannelAuthorizationCallback } from 'pusher-js';
import { ChannelAuthorizationRequestParams } from 'pusher-js/types/src/core/auth/options';
import { BaseWebSocketService } from './base-service';
import { WebSocketListener } from './types';

/**
 * WebSocketService manages WebSocket connections using [Pusher](https://pusher.com/) for web applications.
 *
 * > Required dependencies: `pusher-js`
 *
 * Public methods:
 * - {@link connect} — Initialize and connect client.
 * - {@link subscribeToChannel} — Subscribe and listen to channel events.
 * - {@link unsubscribeFromChannel} — Unsubscribe listener or entire channel.
 */
export class WebSocketService<TChannelName extends string> extends BaseWebSocketService<TChannelName> {
  private pusher?: Pusher;

  /** @inheritdoc */
  public connect(authToken?: string): void {
    const authURL = this.options.authURL;
    this.pusher = new Pusher(this.options.apiKey, {
      ...omit(this.options, ['authURL', 'apiKey', 'useTLS']),
      forceTLS: this.options.useTLS,
      cluster: this.options.cluster,
      channelAuthorization: authURL
        ? {
            // workaround for https://github.com/pusher/pusher-js/issues/715
            endpoint: '',
            transport: 'ajax',
            customHandler: async (
              { socketId, channelName }: ChannelAuthorizationRequestParams,
              callback: ChannelAuthorizationCallback,
            ) => {
              const authData = await this.authorize(channelName, socketId, authToken);
              callback(null, authData);
            },
          }
        : undefined,
    });
    this.pusher.connect();
  }

  /** @inheritdoc */
  public subscribeToChannel(channelName: TChannelName, onEvent: WebSocketListener): void {
    if (!this.pusher) {
      return;
    }

    super.subscribeToChannel(channelName, onEvent);
    this.pusher
      .subscribe(channelName)
      .bind('pusher:subscription_error', () => this.onSubscriptionError(channelName))
      .bind_global(this.getEventHandler(channelName));
  }

  /** @inheritdoc */
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
    this.pusher?.subscribe(channelName).bind_global(this.getEventHandler(channelName));
  }

  private getEventHandler(channelName: string) {
    return (eventName: string, data: any): void => {
      this.channels[channelName].forEach((listener) => listener({ channelName, eventName, data }));
    };
  }
}
