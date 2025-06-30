import { ReactotronPlugin } from './types';
import type { StoreEnhancer } from '@reduxjs/toolkit';
import type { ReactotronReactNative } from 'reactotron-react-native';

/* eslint-disable @typescript-eslint/no-var-requires */
export const setupReactotron = (
  projectName: string,
  plugins: Array<ReactotronPlugin> = [],
): (ReactotronReactNative & { createEnhancer: () => StoreEnhancer }) | undefined => {
  if (__DEV__) {
    const Reactotron: ReactotronReactNative = require('reactotron-react-native').default;

    if (!Reactotron) {
      throw new Error('Reactotron is undefined. Please ensure reactotron-react-native is properly installed.');
    }

    const { reactotronRedux } = require('reactotron-redux');

    if (!reactotronRedux) {
      throw new Error('reactotronRedux is undefined. Please ensure reactotron-redux is properly installed.');
    }

    let instance = Reactotron.configure({ name: projectName }).useReactNative({ log: true });

    // Apply plugins
    instance = plugins.reduce((inst, plugin) => inst.use(plugin(inst)), instance.use(reactotronRedux()));

    return instance.connect() as ReactotronReactNative & { createEnhancer: () => StoreEnhancer };
  }

  return undefined;
};
