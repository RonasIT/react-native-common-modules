import { without } from 'lodash';
import { WebSocketListener } from './types';
import { WebSocketChannels, WebSocketOptions } from './interfaces';
import { ChannelAuthorizationData } from 'pusher-js/types/src/core/auth/options';

export abstract class BaseWebSocketService<TChannelName extends string> {
  protected channels: WebSocketChannels = {};
  protected options: WebSocketOptions;

  constructor(options: WebSocketOptions) {
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

  protected async authorize(channelName: string, socketID: string): Promise<ChannelAuthorizationData> {
    const authOptions = this.options.auth;

    if (!authOptions) {
      throw new Error('Unable to connect to WebSocket, because auth options are missing');
    }

    const response = await fetch(authOptions.url, {
      method: 'POST',
      credentials: authOptions.token ? undefined : 'include',
      headers: this.getAuthHeaders(authOptions.token),
      body: JSON.stringify({
        socket_id: socketID,
        channel_name: channelName
      })
    });

    return await response.json();
  }

  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers;
  }
}
