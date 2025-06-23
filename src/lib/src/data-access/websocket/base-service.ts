import { without } from 'lodash-es';
import { ChannelAuthorizationData } from 'pusher-js/types/src/core/auth/options';
import { WebSocketChannels, WebSocketOptions } from './interfaces';
import { WebSocketListener } from './types';

export abstract class BaseWebSocketService<TChannelName extends string> {
  protected channels: WebSocketChannels = {};
  protected options: WebSocketOptions;

  constructor(options: WebSocketOptions) {
    this.options = options;
  }

  public abstract connect(authToken?: string): void;

  public subscribeToChannel(channelName: TChannelName, onEvent: WebSocketListener): void {
    this.channels[channelName] ? this.channels[channelName].push(onEvent) : (this.channels[channelName] = [onEvent]);
  }

  public unsubscribeFromChannel(channelName: TChannelName, onEvent: WebSocketListener): void {
    this.channels[channelName] = without(this.channels[channelName], onEvent);

    if (this.channels[channelName].length === 0) {
      delete this.channels[channelName];
    }
  }

  protected async authorize(channelName: string, socketID: string, authToken?: string): Promise<ChannelAuthorizationData> {
    const authURL = this.options.authURL;

    if (!authURL || !authToken) {
      throw new Error('Unable to connect to WebSocket, because auth url or token is missing');
    }

    const response = await fetch(authURL, {
      method: 'POST',
      credentials: authToken ? undefined : 'include',
      headers: this.getAuthHeaders(authToken),
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
