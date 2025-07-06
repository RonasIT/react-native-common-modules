import { ReactotronPlugin } from './types';

/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * **setupReactotron**
 *
 * Configures and initializes [Reactotron debugger](https://github.com/infinitered/reactotron) with [redux plugin](https://docs.infinite.red/reactotron/plugins/redux/) for development purposes in a Web environment.
 *
 * Install the [Reactotron app](https://github.com/infinitered/reactotron/releases?q=reactotron-app&expanded=true) on your computer for use.
 *
 * > Required dependencies: `@reduxjs/toolkit`, `reactotron-react-js`, `reactotron-redux`,
 *
 * @param projectName Human‑readable name shown in the Reactotron UI.
 * @param plugins – Optional array of {@link ReactotronPlugin|plugins} to register **after** the core presets.
 * @returns Connected Reactotron instance extended with `createEnhancer`, or `undefined` outside dev‑mode.
 */
export const setupReactotron = (projectName: string, plugins: Array<ReactotronPlugin> = []) => {
  if (__DEV__) {
    const Reactotron = require('reactotron-react-js').default;

    if (!Reactotron) {
      throw new Error('Reactotron for web is undefined. Please ensure reactotron-react-js is properly installed.');
    }

    const { reactotronRedux } = require('reactotron-redux');

    if (!reactotronRedux) {
      throw new Error('reactotronRedux is undefined. Please ensure reactotron-redux is properly installed.');
    }

    let instance = Reactotron.configure({ name: projectName });

    // Apply plugins
    instance = plugins.reduce((inst, plugin) => inst.use(plugin(inst)), instance.use(reactotronRedux()));

    return instance.connect();
  }

  return undefined;
};
