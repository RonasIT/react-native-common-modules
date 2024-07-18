import { ReactElement, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VirtualizedList, VirtualizedListProps } from '@ronas-it/react-native-common-modules';
import { booksMock } from '../../mocks';
import { Book } from '../../models';

export function VirtualizedListExample(): ReactElement {
  const [direction, setDirection] = useState<'UP' | 'DOWN'>();
  const [isScrollDirectionChanged, setIsScrollDirectionChanged] = useState(false);

  const handleScrollUp = (): void => {
    setDirection('UP');
    // setIsScrollDirectionChanged(false);
  };

  const handleScrollDown = (): void => {
    setDirection('DOWN');
    // setIsScrollDirectionChanged(false);
  };

  const handleScrollEnd = (): void => {
    setDirection(undefined);
    setIsScrollDirectionChanged(false);
  };

  const handleScrollDirectionChange = (): void => {
    console.warn('CHANGE');
    setIsScrollDirectionChanged(true);
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

  return (
    <View style={styles.example}>
      <View style={styles.container}>
        <Text style={styles.title}>Virtualized list</Text>
        <Text>
          Direction: {direction}
          {isScrollDirectionChanged ? ' (changed)' : ''}
        </Text>
      </View>
      <VirtualizedList
        estimatedItemSize={100}
        data={booksMock}
        renderItem={renderItem}
        onScrollUp={handleScrollUp}
        onScrollDown={handleScrollDown}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollDirectionChange={handleScrollDirectionChange}
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
