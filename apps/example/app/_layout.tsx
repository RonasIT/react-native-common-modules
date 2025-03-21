import { setLanguage } from '@ronas-it/react-native-common-modules/src/utils/i18n';
import { Stack } from 'expo-router';
import { ReactElement, createContext, useState } from 'react';

export { ErrorBoundary } from 'expo-router';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  initialRouteName: 'index',
};

const translations = {
  en: {
    ...require('i18n/example/en.json')
  },
  fr: {
    ...require('i18n/example/fr.json')
  }
};

const useLanguage = setLanguage(translations, 'en');

interface LanguageContextProps {
  language: string;
  onLanguageChange?: (language: keyof typeof translations) => void;
}

export const LanguageContext = createContext<LanguageContextProps>({ language: 'en' });

function App(): ReactElement {
  return (
    <Stack>
      <Stack.Screen name='index' />
    </Stack>
  );
}

export default function RootLayout(): ReactElement | null {
  const [language, setLanguage] = useState<keyof typeof translations>('en');

  useLanguage(language);

  return (
    <LanguageContext.Provider value={{ language, onLanguageChange: setLanguage }}>
      <App />
    </LanguageContext.Provider>
  );
}
