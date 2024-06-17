import { ExpoConfig } from '@expo/config';
import { EASConfig } from 'expo-constants/build/Constants.types';

const createConfig = (): Omit<ExpoConfig, 'extra'> & { extra: { eas: EASConfig } & typeof extra } => {
  const projectId = '';

  const appId = 'com.example.dev';

  const extra = {
    eas: { projectId } as EASConfig,
  };

  return {
    name: 'Example Dev',
    slug: 'example-app',
    scheme: 'example-dev',
    version: '0.1.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    updates: {
      url: `https://u.expo.dev/${projectId}`,
    },
    ios: {
      bundleIdentifier: appId,
      supportsTablet: false,
      buildNumber: '1',
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      package: appId,
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
    },
    plugins: ['expo-router'],
    extra,
  };
};

export default createConfig;
