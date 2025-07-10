import { without } from 'lodash-es';
import { ChannelAuthorizationData } from 'pusher-js/types/src/core/auth/options';
import { WebSocketChannels, WebSocketOptions } from './interfaces';
import { WebSocketListener } from './types';

/**
 * Base class containing shared logic for **Pusher‑powered** WebSocket communication.
 * Concrete runtimes (React Native vs Web) extend and implement their own `connect` method.
 *
 * @typeParam TChannelName – String literal union of allowed channel names.
 */
export abstract class BaseWebSocketService<TChannelName extends string> {
  protected channels: WebSocketChannels = {};
  protected options: WebSocketOptions;

  /**
   * @param options {@link WebSocketOptions Constructor options.}
   */
  constructor(options: WebSocketOptions) {
    this.options = options;
  }

  /** Initializes and connects the Pusher client. Optional authorization token is used for secure connections.
   *
   * @param authToken Optional bearer token used for authenticating private channels.
   */
  public abstract connect(authToken?: string): void;

  /**
   * Subscribes to a specified channel and registers an event listener for incoming messages on that channel.
   *
   * @param channelName Channel to subscribe to.
   * @param onEvent Callback executed for **every event** received on that channel.
   */
  public subscribeToChannel(channelName: TChannelName, onEvent: WebSocketListener): void {
    this.channels[channelName] ? this.channels[channelName].push(onEvent) : (this.channels[channelName] = [onEvent]);
  }

  /**
   * Removes an event listener and, if there is no listeners for a specified channel, unsubscribes from it.
   *
   * @param channelName Channel to unsubscribe to.
   * @param onEvent Callback executed for **every event** received on that channel.
   */
  public unsubscribeFromChannel(channelName: TChannelName, onEvent: WebSocketListener): void {
    this.channels[channelName] = without(this.channels[channelName], onEvent);

    if (this.channels[channelName].length === 0) {
      delete this.channels[channelName];
    }
  }

  /**
   * Performs **server‑side auth** for private channels.
   *
   * @param channelName – Channel for which auth is requested.
   * @param socketID – Pusher socket ID.
   * @param authToken – Optional bearer token to send in the `Authorization` header.
   * @returns JSON with `auth` / `channel_data` fields expected by Pusher.
   */
  protected async authorize(
    channelName: string,
    socketID: string,
    authToken?: string,
  ): Promise<ChannelAuthorizationData> {
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
        channel_name: channelName,
      }),
    });

    return await response.json();
  }

  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }
}
