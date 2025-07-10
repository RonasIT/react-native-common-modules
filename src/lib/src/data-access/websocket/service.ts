import { Pusher, PusherEvent } from '@pusher/pusher-websocket-react-native';
import { omit } from 'lodash-es';
import { BaseWebSocketService } from './base-service';
import { WebSocketOptions } from './interfaces';
import { WebSocketListener } from './types';

/**
 * WebSocketService manages WebSocket connections using [Pusher](https://pusher.com/) for mobile applications.
 *
 * Doesn't support Expo Go.
 *
 * > Required dependencies: `@pusher/pusher-websocket-react-native`
 *
 * Public methods:
 * - {@link connect} — Initialize and connect client.
 * - {@link subscribeToChannel} — Subscribe and listen to channel events.
 * - {@link unsubscribeFromChannel} — Unsubscribe listener or entire channel.
 */
export class WebSocketService<TChannelName extends string> extends BaseWebSocketService<TChannelName> {
  private readonly pusher: Pusher;

  constructor(options: WebSocketOptions) {
    super(options);
    this.pusher = Pusher.getInstance();
  }

  /** @inheritdoc */
  public async connect(authToken?: string): Promise<void> {
    const activityTimeout = this.options.activityTimeout;
    const pongTimeout = this.options.pongTimeout;

    await this.pusher.init({
      ...omit(this.options, ['authURL', 'activityTimeout', 'pongTimeout']),
      // RN Pusher accepts timeouts in seconds
      activityTimeout: activityTimeout ? Math.round(activityTimeout) : undefined,
      pongTimeout: pongTimeout ? Math.round(pongTimeout) : undefined,
      onSubscriptionError: (channelName) => this.addEventHandlerToPusher(channelName as TChannelName),
      onAuthorizer: this.options.authURL
        ? async (channelName: string, socketID: string) => {
            return await this.authorize(channelName, socketID, authToken);
          }
        : undefined,
    });
    this.pusher.connect();
  }

  /** @inheritdoc */
  public subscribeToChannel(channelName: TChannelName, onEvent: WebSocketListener): void {
    super.subscribeToChannel(channelName, onEvent);
    this.addEventHandlerToPusher(channelName);
  }

  /** @inheritdoc */
  public async unsubscribeFromChannel(channelName: TChannelName, onEvent: WebSocketListener): Promise<void> {
    super.unsubscribeFromChannel(channelName, onEvent);

    if (!this.channels[channelName] || this.channels[channelName].length === 0) {
      await this.pusher.unsubscribe({ channelName });
    }
  }

  private addEventHandlerToPusher(channelName: TChannelName): void {
    const eventHandler = (event: PusherEvent): void => {
      this.channels[channelName].forEach((listener) => listener(event));
    };

    this.pusher.subscribe({
      channelName,
      onEvent: eventHandler,
    });
  }
}
