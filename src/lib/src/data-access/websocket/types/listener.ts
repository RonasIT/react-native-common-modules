import { PusherEvent } from '@pusher/pusher-websocket-react-native';

export type WebSocketListener = (event: PusherEvent) => void;
