import type { StoreEnhancer } from '@reduxjs/toolkit';
import type { ReactotronReactNative } from 'reactotron-react-native';

/* eslint-disable @typescript-eslint/no-var-requires */
export const setupReactotron = (
  projectName: string
): (ReactotronReactNative & { createEnhancer: () => StoreEnhancer }) | undefined => {
  if (__DEV__) {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (!AsyncStorage) {
      throw new Error(
        'AsyncStorage is undefined. Please ensure @react-native-async-storage/async-storage is properly installed.'
      );
    }

    const Reactotron: ReactotronReactNative = require('reactotron-react-native').default;
    if (!Reactotron) {
      throw new Error('Reactotron is undefined. Please ensure reactotron-react-native is properly installed.');
    }

    const { reactotronRedux } = require('reactotron-redux');
    if (!reactotronRedux) {
      throw new Error('reactotronRedux is undefined. Please ensure reactotron-redux is properly installed.');
    }

    return Reactotron.configure({ name: projectName })
      .setAsyncStorageHandler(AsyncStorage)
      .use(reactotronRedux())
      .useReactNative({ log: true })
      .connect() as ReactotronReactNative & { createEnhancer: () => StoreEnhancer };
  }

  return undefined;
};
