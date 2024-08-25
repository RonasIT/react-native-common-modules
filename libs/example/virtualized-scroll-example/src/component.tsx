import { ReactElement, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VirtualizedList, VirtualizedListProps } from '@ronas-it/react-native-common-modules';
import { booksMock } from './mocks';
import { Book } from './models';

export function VirtualizedListExample(): ReactElement {
  const [direction, setDirection] = useState<'UP' | 'DOWN'>();

  const handleScrollUp = (): void => {
    setDirection('UP');
  };

  const handleScrollDown = (): void => {
    setDirection('DOWN');
  };

  const handleScrollEnd = (): void => {
    setDirection(undefined);
  };

  const renderItem: VirtualizedListProps<Book>['renderItem'] = ({ item }) => {
    return (
      <View style={styles.item}>
        <Text>{item.isbn}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View>
          <Text>{item.authors.join(', ')}</Text>
        </View>
      </View>
    );
  };

  const keyExtractor: VirtualizedListProps<Book>['keyExtractor'] = (item) => item.isbn;

  return (
    <View style={styles.example}>
      <View style={styles.container}>
        <Text style={styles.title}>Virtualized list</Text>
        <Text>Direction: {direction}</Text>
      </View>
      <VirtualizedList
        estimatedItemSize={86}
        data={booksMock}
        renderItem={renderItem}
        onScrollUp={handleScrollUp}
        onScrollDown={handleScrollDown}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        keyExtractor={keyExtractor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  example: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 5,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
