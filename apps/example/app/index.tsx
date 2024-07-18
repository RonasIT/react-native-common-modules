import {
  AppPressable,
  AppSafeAreaView,
  VirtualizedList,
  VirtualizedListProps,
} from '@ronas-it/react-native-common-modules';
import { ReactElement } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

export default function RootScreen(): ReactElement {
  const onPress = () => Alert.alert('Button pressed');

  const renderItem: VirtualizedListProps<string>['renderItem'] = ({ item }) => {
    return (
      <View style={{ height: 100 }}>
        <Text>{item}</Text>
      </View>
    );
  };

  return (
    <AppSafeAreaView edges={['bottom']} style={styles.safeAreaContainer}>
      <View style={styles.pressableContainer}>
        <AppPressable onPress={onPress} hitSlop={10}>
          <Text>Press me</Text>
        </AppPressable>
      </View>
      <View style={styles.listContainer}>
        <VirtualizedList
          estimatedItemSize={100}
          data={['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']}
          renderItem={renderItem}
        />
      </View>
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  pressableContainer: {
    backgroundColor: '#D3D3D3',
    padding: 10,
  },
  listContainer: {
    flex: 1,
  },
});
