/* eslint-disable @typescript-eslint/no-var-requires */
export const setupReactotron = (projectName: string) => {
  if (__DEV__) {
    const Reactotron = require('reactotron-react-js').default;

    if (!Reactotron) {
      throw new Error('Reactotron for web is undefined. Please ensure reactotron-react-js is properly installed.');
    }

    const { reactotronRedux } = require('reactotron-redux');

    if (!reactotronRedux) {
      throw new Error('reactotronRedux is undefined. Please ensure reactotron-redux is properly installed.');
    }

    return Reactotron.configure({ name: projectName }).use(reactotronRedux()).connect();
  }

  return undefined;
};
