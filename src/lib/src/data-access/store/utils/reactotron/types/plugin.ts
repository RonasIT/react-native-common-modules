import { PluginCreator } from 'reactotron-core-client';
import type { ReactotronReactNative } from 'reactotron-react-native';

/**
 * Factory for building strongly‑typed Reactotron plugins that can be used in both
 * React Native and Web targets.
 *
 * @param reactotron The current Reactotron instance.
 * @returns A {@link PluginCreator} ready to be passed to `reactotron.use()`.
 */
export type ReactotronPlugin = (reactotron: ReactotronReactNative) => PluginCreator<ReactotronReactNative>;
