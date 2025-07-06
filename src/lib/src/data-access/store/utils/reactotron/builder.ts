import { ReactotronPlugin } from './types';
import type { StoreEnhancer } from '@reduxjs/toolkit';
import type { ReactotronReactNative } from 'reactotron-react-native';

/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * **setupReactotron**
 *
 * Configures and initializes [Reactotron debugger](https://github.com/infinitered/reactotron) with [redux plugin](https://docs.infinite.red/reactotron/plugins/redux/) for development purposes in a React Native environment.
 *
 * Install the [Reactotron app](https://github.com/infinitered/reactotron/releases?q=reactotron-app&expanded=true) on your computer for use.
 *
 *  * > Required dependencies: `@reduxjs/toolkit`, `reactotron-react-native`, `reactotron-redux`,
 *
 * @param projectName Human‑readable name shown in the Reactotron UI.
 * @param plugins – Optional array of {@link ReactotronPlugin|plugins} to register **after** the core presets.
 * @returns Connected Reactotron instance extended with `createEnhancer`, or `undefined` outside dev‑mode.
 */
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
