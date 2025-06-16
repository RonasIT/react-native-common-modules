import { VirtualizedListExample } from '@ronas-it/example/virtualized-scroll-example';
import { AppPressable } from '@ronas-it/react-native-common-modules/src/ui/pressable';
import { AppSafeAreaView } from '@ronas-it/react-native-common-modules/src/ui/safe-area-view';
import { useTranslation } from '@ronas-it/react-native-common-modules/src/utils/i18n';
import { ReactElement, useContext, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { LanguageContext } from './_layout';

export default function RootScreen(): ReactElement {
  const translate = useTranslation('EXAMPLE');
  const { language, onLanguageChange } = useContext(LanguageContext);

  const onPress = (): void => Alert.alert('Button pressed');

  const handleLanguageChange = (): void => {
    onLanguageChange?.(language === 'en' ? 'fr' : 'en');
  };

  return (
    <AppSafeAreaView edges={['bottom']} style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Pressable</Text>
        <AppPressable onPress={onPress} hitSlop={10}>
          <Text>{translate('BUTTON_PRESS_ME')}</Text>
        </AppPressable>
        <AppPressable onPress={handleLanguageChange} hitSlop={10}>
          <Text>{translate('BUTTON_LANGUAGE')}</Text>
        </AppPressable>
      </View>
      <VirtualizedListExample />
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  container: {
    paddingHorizontal: 20,
    backgroundColor: '#D3D3D3',
    paddingVertical: 20,
  },
});
