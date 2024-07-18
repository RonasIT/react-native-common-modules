import { VirtualizedListExample } from '@ronas-it/examples';
import { AppPressable, AppSafeAreaView } from '@ronas-it/react-native-common-modules';
import { ReactElement } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

export default function RootScreen(): ReactElement {
  const onPress = () => Alert.alert('Button pressed');

  return (
    <AppSafeAreaView edges={['bottom']} style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Pressable</Text>
        <AppPressable onPress={onPress} hitSlop={10}>
          <Text>Press me</Text>
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
