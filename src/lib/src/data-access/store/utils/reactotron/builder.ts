import type { StoreEnhancer } from '@reduxjs/toolkit';
import type { ReactotronReactNative } from 'reactotron-react-native';

/* eslint-disable @typescript-eslint/no-var-requires */
export const setupReactotron = (
  projectName: string
): (ReactotronReactNative & { createEnhancer: () => StoreEnhancer }) | undefined => {
  if (__DEV__) {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const Reactotron: ReactotronReactNative = require('reactotron-react-native').default;
    const { reactotronRedux } = require('reactotron-redux');

    return Reactotron.configure({ name: projectName })
      .setAsyncStorageHandler(AsyncStorage)
      .use(reactotronRedux())
      .useReactNative({ log: true })
      .connect() as ReactotronReactNative & { createEnhancer: () => StoreEnhancer };
  }

  return undefined;
};
