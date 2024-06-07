# React Native Common Modules

Common components for Ronas IT projects.

At the moment this library contains the following components:

## `AppPressable`

Component can be used in the same way as the built-in `Pressable` component, but it also includes opacity control.

### Props

- `pressedOpacity`: Opacity value. Default is 0.4.
- `style`: Custom styles to apply to the view.

### Usage

```jsx
<AppPressable style={styles.button} pressedOpacity={0.5}>
  <Text>Press Me</Text>
</AppPressable>
```

## `AppSafeAreaView`

Is a component that ensures safe display of content within the visible area of the screen, not overlapping with system interface elements such as screen notches or system status indicators.

### Props

- `edges`: An array indicating which edges of the screen to respect. Possible values are 'top', 'right', 'bottom', 'left'. Default is all edges.
- `style`: Custom styles to apply to the view. Note that padding values will be adjusted to respect safe area insets.

### Usage

```jsx
<AppSafeAreaView edges={['top', 'bottom']} style={styles.container}>
  <Text>Content goes here</Text>
</AppSafeAreaView>
````
