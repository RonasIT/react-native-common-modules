import { ReactotronPlugin } from './types';

/* eslint-disable @typescript-eslint/no-var-requires */
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
