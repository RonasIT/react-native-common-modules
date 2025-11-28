import { without } from 'lodash-es';
import { ChannelAuthorizationData } from 'pusher-js/types/src/core/auth/options';
import { defaultPusherOptions } from './default-config';
import { WebSocketChannels, WebSocketHandlers, WebSocketOptions } from './interfaces';
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
  private authAttempts: number;

  /**
   * @param options {@link WebSocketOptions Constructor options.}
   */
  constructor(options: WebSocketOptions) {
    this.options = { ...defaultPusherOptions, ...options };
    this.authAttempts = 0;
  }

  /**
   * Initializes the Pusher client.
   * Should be called only once before calling {@link connect}.
   * If an authorization token is provided, it will be used for secure connections.
   *
   * @param tokenGetter Optional function to get the authorization token or a string token.
   * @param handlers Optional event handlers for the WebSocket connection. Defaults to an empty object.
   */
  public abstract init(tokenGetter?: string | (() => string), handlers?: WebSocketHandlers): void;

  /**
   * Connects the client to the Pusher server.
   * Should be called after initializing the client using {@link init}.
   */
  public abstract connect(): void;

  /**
   * Disconnects the client from the Pusher server.
   * Should be called when the client is no longer needed.
   */
  public abstract disconnect(): void;

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
   * Removes an event listener and, if there are no listeners for a specified channel, unsubscribes from it.
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
   * @param tokenGetter Optional function to get the authorization token or a string token.
   * @returns JSON with `auth` / `channel_data` fields expected by Pusher.
   */
  protected authorize = async (channelName: string, socketID: string, tokenGetter?: string | (() => string)): Promise<ChannelAuthorizationData> => {
    const authURL = this.options.authURL;
    const maxDelayMs = (this.options.authorizerTimeoutInSeconds || 60) * 1000;

    if (!authURL || !tokenGetter) {
      throw new Error('Unable to connect to WebSocket, because auth url or token getter is missing');
    }

    const authToken = typeof tokenGetter === 'function' ? tokenGetter() : tokenGetter;
    this.authAttempts++;

    const response = await fetch(authURL, {
      method: 'POST',
      credentials: authToken ? undefined : 'include',
      headers: this.getAuthHeaders(authToken),
      body: JSON.stringify({
        socket_id: socketID,
        channel_name: channelName,
      }),
    });

    if (!response.ok) {
      const delayMs = 1000 * Math.pow(2, this.authAttempts - 1); // Exponential backoff

      if (delayMs < maxDelayMs) {
        await new Promise(resolve => setTimeout(resolve, delayMs));

        return this.authorize(channelName, socketID, tokenGetter);
      } else {
        this.authAttempts = 0;
        throw new Error(`Failed to subscribe to channel ${channelName}. Authorizer response status ${response.status}`);
      }
    }

    this.authAttempts = 0;

    return await response.json();

  }

  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }
}
