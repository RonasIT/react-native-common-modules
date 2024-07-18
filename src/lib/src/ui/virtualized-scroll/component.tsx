import { FlashList, FlashListProps } from '@shopify/flash-list';
import React, { ReactElement, useEffect, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export interface VirtualizedListProps<T> extends FlashListProps<T> {
  onScrollUp?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollDown?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollDirectionChange?: (event: { isScrolledDown: boolean }) => void;
  scrollDirectionChangeThreshold?: number;
}

function Component<T>(
  {
    onScroll,
    onScrollUp,
    onScrollDown,
    onScrollDirectionChange,
    scrollDirectionChangeThreshold = 8,
    ...restProps
  }: VirtualizedListProps<T>,
  ref: React.ForwardedRef<FlashList<T>>
): ReactElement {
  const currentOffset = useRef<number>(0);
  const isScrolledDown = useRef<boolean | undefined>(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    event.persist();

    const offsetY = event.nativeEvent.contentOffset.y;
    const eventOffset = currentOffset.current - offsetY;

    if (offsetY < scrollDirectionChangeThreshold || Math.abs(eventOffset) > scrollDirectionChangeThreshold) {
      const wasScrolledDown = eventOffset < 0 && offsetY > scrollDirectionChangeThreshold;

      if (isScrolledDown.current !== wasScrolledDown) {
        onScrollDirectionChange?.({ isScrolledDown: wasScrolledDown });
        isScrolledDown.current = wasScrolledDown;
      }
    }

    if (currentOffset.current > offsetY) {
      onScrollUp?.(event);
    }

    if (currentOffset.current < offsetY) {
      onScrollDown?.(event);
    }

    currentOffset.current = offsetY;

    onScroll?.(event);
  };

  useEffect(() => {
    isScrolledDown.current = undefined;
  }, [restProps.initialScrollIndex]);

  return <FlashList ref={ref} onScroll={handleScroll} {...restProps} />;
}

export const VirtualizedList = React.forwardRef(Component) as <T>(
  props: VirtualizedListProps<T> & { ref?: React.ForwardedRef<FlashList<T>> }
) => ReturnType<typeof Component>;
