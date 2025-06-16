import { forwardRef } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export interface AppPressableProps extends PressableProps {
  pressedOpacity?: number;
}

export const AppPressable = forwardRef<View, AppPressableProps>(({
  children,
  style,
  pressedOpacity = 0.4,
  ...props
}, ref) => {
  return (
    <Pressable
      ref={ref}
      style={({ pressed }) =>
        StyleSheet.flatten([
          { opacity: pressed ? pressedOpacity : 1 },
          style as StyleProp<ViewStyle>,
        ])
      }
      {...props}
    >
      {children}
    </Pressable>
  );
});
