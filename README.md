# React Native Common Modules

Common components for Ronas IT projects.

## Start the example app

1. Install dependencies: `npm install`
2. Start app for local development: `cd apps/example && npx expo start`
   - Use [Expo Go](https://expo.dev/client) to run mobile version

At the moment this library contains the following components:

## `AppPressable`

Component can be used in the same way as the built-in `Pressable` component, but it also includes opacity control.

### Props

- `pressedOpacity`: Opacity value. Default is 0.4.

### Usage

```jsx
<AppPressable style={styles.button} pressedOpacity={0.5}>
  <Text>Press Me</Text>
</AppPressable>
```

## `AppSafeAreaView`

Is a component for granular control of safe area edges on each screen. The difference from `SafeAreaView` in [react-native-safe-area-context](https://www.npmjs.com/package/react-native-safe-area-context) is that the container adds padding to the elements inside it, rather than to the entire screen, making it more flexible for use.

### Props

- `edges`: An array indicating which edges of the screen to respect. Possible values are 'top', 'right', 'bottom', 'left'. Defaults to all edges.
- `style`: Custom styles to apply to the view. Note that padding values will be adjusted to respect safe area insets.

### Usage

```jsx
<AppSafeAreaView edges={['top', 'bottom']} style={styles.container}>
  <Text>Content goes here</Text>
</AppSafeAreaView>
````
