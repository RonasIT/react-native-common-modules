import React from 'react';
import { Pressable, PressableProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';

export interface AppPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  pressedOpacity?: number;
}

export function AppPressable({ children, style, pressedOpacity = 0.4, ...props }: AppPressableProps) {
  return (
    <Pressable
      style={({ pressed }) => StyleSheet.flatten([{ opacity: pressed ? pressedOpacity : 1 }, style])}
      {...props}>
      {children}
    </Pressable>
  );
}
