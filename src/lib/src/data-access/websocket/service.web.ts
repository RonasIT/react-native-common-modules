import Pusher from 'pusher-js';
import { BaseWebSocketService } from './base-service';
import { WebSocketListener } from './types';

export class WebSocketService<TChannelName extends string> extends BaseWebSocketService<TChannelName> {
  private pusher?: Pusher;

  public connect(): void {
    this.pusher = new Pusher(this.options.key, {
      cluster: this.options.cluster
    });
    this.pusher.connect();
  }

  public subscribeToChannel(channelName: TChannelName, onEvent: WebSocketListener): void {
    if (!this.pusher) {
      return;
    }

    super.subscribeToChannel(channelName, onEvent);

    const eventHandler = (eventName: string, data: any): void => {
      this.channels[channelName].forEach((listener) => listener({ channelName, eventName, data }));
    };

    this.pusher.subscribe(channelName)
      .bind('pusher:subscription_error', () => this.onSubscriptionError(channelName))
      .bind_global(eventHandler);
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
    const eventHandler = (eventName: string, data: any): void => {
      this.channels[channelName].forEach((listener) => listener({ channelName, eventName, data }));
    };

    this.pusher
      ?.subscribe(channelName)
      .bind_global(eventHandler);
  }
}
