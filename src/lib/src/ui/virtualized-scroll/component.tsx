import { FlashList, FlashListProps } from '@shopify/flash-list';
import React, { ReactElement, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export interface VirtualizedListProps<T> extends FlashListProps<T> {
  onScrollUp?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollDown?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

function Component<T>(
  { onScroll, onScrollUp, onScrollDown, ...restProps }: VirtualizedListProps<T>,
  ref: React.ForwardedRef<FlashList<T>>
): ReactElement {
  const currentOffset = useRef<number>(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    event.persist();
    const offsetY = event.nativeEvent.contentOffset.y;

    if (currentOffset.current > offsetY) {
      onScrollUp?.(event);
    }

    if (currentOffset.current < offsetY) {
      onScrollDown?.(event);
    }

    currentOffset.current = offsetY;
    onScroll?.(event);
  };

  return <FlashList ref={ref} onScroll={handleScroll} {...restProps} />;
}

export const VirtualizedList = React.forwardRef(Component) as <T>(
  props: VirtualizedListProps<T> & { ref?: React.ForwardedRef<FlashList<T>> }
) => ReturnType<typeof Component>;
