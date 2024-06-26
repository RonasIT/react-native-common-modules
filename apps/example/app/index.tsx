import { AppPressable, AppSafeAreaView } from '@ronas-it/react-native-common-modules';
import { ReactElement } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

export default function RootScreen(): ReactElement {
  const onPress = () => Alert.alert('Button pressed');

  return (
    <AppSafeAreaView edges={['bottom']} style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <AppPressable onPress={onPress} hitSlop={10}>
        <Text>Press me</Text>
        </AppPressable>
      </View>
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D3D3D3'
  },
});
