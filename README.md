# React Native Common Modules

Common components for Ronas IT projects.

## Start the example app

1. Install dependencies: `npm install`
2. Start app for local development: `cd apps/example && npx expo start`
3. Use [Expo Go](https://expo.dev/client) to run mobile version

## Usage

1. Install the package: `npm i @ronas-it/react-native-common-modules`
2. Import modules to your app and use as described below

### UI-components

At the moment this library contains the following components:

#### 1. `AppPressable`

This component can be used in the same way as the built-in [Pressable component](https://reactnative.dev/docs/pressable), but it also includes opacity control.

**Props:**

- `pressedOpacity`: Opacity value. Default is 0.4.

**Example:**

```jsx
<AppPressable style={styles.button} pressedOpacity={0.5}>
  <Text>Press Me</Text>
</AppPressable>
```

#### 2. `AppSafeAreaView`

A component for granular control of safe area edges on each screen. The difference from `SafeAreaView` in [react-native-safe-area-context](https://www.npmjs.com/package/react-native-safe-area-context) is that the container adds padding to the elements inside it, rather than to the entire screen, making it more flexible for use.

**Props:**

- `edges`: An array indicating which edges of the screen to respect. Possible values are 'top', 'right', 'bottom', 'left'. Defaults to all edges.
- `style`: Custom styles to apply to the view. Note that padding values will be adjusted to respect safe area insets.

**Example:**

```jsx
<AppSafeAreaView edges={['top', 'bottom']} style={styles.container}>
  <Text>Content goes here</Text>
</AppSafeAreaView>
```

#### 3. `VirtualizedList`

A component-wrapper for [FlashList](https://shopify.github.io/flash-list/), that includes `onScrollUp` and `onScrollDown` props.

**Props:**

- `onScrollUp`: Called when user scrolls up.
- `onScrollDown`: Called when user scrolls down.

> **_NOTE:_** `onScrollUp` and `onScrollDown` are synced with `onScroll`

**Example:**

```tsx
export function App(): ReactElement {
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
      <View>
        <Text>{item.isbn}</Text>
        <Text>{item.title}</Text>
      </View>
    );
  };

  const keyExtractor: VirtualizedListProps<Book>['keyExtractor'] = (item) => item.isbn;

  return (
    <View>
      <Text>Direction: {direction}</Text>
      <VirtualizedList
        estimatedItemSize={86}
        data={books}
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
```

### Services

#### 1. Push notifications

##### `PushNotificationsService`

Service for integrating [Expo push notifications](https://docs.expo.dev/push-notifications/overview/) into apps.
Requires [setup](https://docs.expo.dev/push-notifications/push-notifications-setup/) and [backend implementation](https://docs.expo.dev/push-notifications/sending-notifications/) for sending notifications.

`PushNotificationsService` public methods:

- `obtainPushNotificationsToken` - get an Expo token that can be used to send a push notification to the device using Expo's push notifications service.

- `pushToken` - getter for retrieving the token if it was already obtained.

##### `usePushNotifications`

Hook, that automatically subscribes the device to receive push notifications when a user becomes authenticated, and unsubscribes when a user becomes non-authenticated. It supports custom subscription and unsubscription logic through provided functions or API configuration. Listens for [responses](https://docs.expo.dev/push-notifications/receiving-notifications/) to notifications and executes a callback, if provided, when a notification is interacted with.
Used in the root `App` component.

`usePushNotifications` hook arguments:

- `isAuthenticated` (required) - flag, that indicates whether the user is authenticated or not.
- `onNotificationResponse` (optional) - callback when a notification is interacted with.
- `subscribeDevice` (optional) - function for subscribing the device.
- `unsubscribeDevice` (optional) - function for unsubscribing the device.
- `apiConfig` (optional) - API configuration for subscribing and unsubscribing the device (when `subscribeDevice` and `unsubscribeDevice` are not provided).
- `apiErrorHandler` (optional) - API error handler for subscribe/unsubscribe functions.
- `getTokenErrorHandler` (optional) - handler for error that occur when attempting to obtain a push notifications token.

**Example:**

```ts
// Somewhere in a root component of your app:
const authToken = useSelector(authSelectors.token);
...
usePushNotifications({
  apiConfig: {
    subscribeDeviceUrl: 'https://your-api.com/api/v1/push-notifications/subscribe',
    unsubscribeDeviceUrl: 'https://your-api.com/api/v1/push-notifications/unsubscribe',
    accessToken: authToken,
  },
  isAuthenticated: !!authToken,
})
```

### Development utils

#### 1. `setupReactotron(projectName: string)`

Configures and initializes [Reactotron debugger](https://github.com/infinitered/reactotron) with [redux plugin](https://docs.infinite.red/reactotron/plugins/redux/) for development purposes.
Install the [Reactotron app](https://github.com/infinitered/reactotron/releases?q=reactotron-app&expanded=true) on your computer for use.

**Example:**

```ts
import { createStoreInitializer } from '@ronas-it/rtkq-entity-api';
import { setupReactotron } from '@ronas-it/react-native-common-modules';

const reactotron = setupReactotron('your-app');
const enhancers = reactotron ? [reactotron.createEnhancer()] : [];

const initStore = createStoreInitializer({
  rootReducer: rootReducer as unknown as Reducer<AppState>,
  middlewares,
  enhancers,
});
```
