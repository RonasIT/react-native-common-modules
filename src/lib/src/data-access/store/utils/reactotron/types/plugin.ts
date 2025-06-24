import { PluginCreator } from 'reactotron-core-client';
import type { ReactotronReactNative } from 'reactotron-react-native';

export type ReactotronPlugin = (reactotron: ReactotronReactNative) => PluginCreator<ReactotronReactNative>;
