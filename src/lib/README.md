# React Native Common Modules

Common components for Ronas IT projects.

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
import { AppPressable } from '@ronas-it/react-native-common-modules';

<AppPressable style={styles.button} pressedOpacity={0.5}>
  <Text>Press Me</Text>
</AppPressable>
```

#### 2. `AppSafeAreaView`

> **_NOTE:_** Required dependencies: `react-native-safe-area-context`

A component for granular control of safe area edges on each screen. The difference from `SafeAreaView` in [react-native-safe-area-context](https://www.npmjs.com/package/react-native-safe-area-context) is that the container adds padding to the elements inside it, rather than to the entire screen, making it more flexible for use.

**Props:**

- `edges`: An array indicating which edges of the screen to respect. Possible values are 'top', 'right', 'bottom', 'left'. Defaults to all edges.
- `style`: Custom styles to apply to the view. Note that padding values will be adjusted to respect safe area insets.

**Example:**

```jsx
import { AppSafeAreaView } from '@ronas-it/react-native-common-modules';

<AppSafeAreaView edges={['top', 'bottom']} style={styles.container}>
  <Text>Content goes here</Text>
</AppSafeAreaView>
```

#### 3. `VirtualizedList`

> **_NOTE:_** Required dependencies: `@shopify/flash-list`

A component-wrapper for [FlashList](https://shopify.github.io/flash-list/), that includes `onScrollUp` and `onScrollDown` props.

**Props:**

- `onScrollUp`: Called when user scrolls up.
- `onScrollDown`: Called when user scrolls down.

> **_NOTE:_** `onScrollUp` and `onScrollDown` are synced with `onScroll`

**Example:**

```tsx
import { VirtualizedList, VirtualizedListProps } from '@ronas-it/react-native-common-modules';

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

> **_NOTE:_** Required dependencies: `@pusher/pusher-websocket-react-native`, `pusher-js`, `expo-notifications`, `expo-router`, `expo-constants`, `expo-device`, `expo-modules-core`

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
import { usePushNotifications } from '@ronas-it/react-native-common-modules';

...
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

#### 2. Storage

> **_NOTE:_** The `AsyncStorageItem` and `SecureStorageItem` classes are deprecated and will be removed in future versions. Please use the `react-native-mmkv` implementation instead.

> **_NOTE:_** Required dependencies: `@react-native-async-storage/async-storage`, `expo-secure-store`

A library that provides two types of key-value storage API: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/docs/usage/) and [SecuredStorage](https://docs.expo.dev/versions/latest/sdk/securestore/) (IOS, Android).

**Example**

Implement storage service:

```ts
import { AsyncStorageItem, SecureStorageItem } from '@ronas-it/react-native-common-modules';

class AppStorageService {
  public token = new SecureStorageItem('token');
  public tokenExpiryDate = new SecureStorageItem('tokenExpiryDate');
  public language = new AsyncStorageItem('language');
}

export const appStorageService = new AppStorageService();
```

Usage:
```ts
// Get storage item
const token = await appStorageService.token.get();
// Set storage item
appStorageService.token.set('new_token');
// Delete storage item
appStorageService.token.remove();
```

#### 3. Image Picker

> **_NOTE:_** Required dependencies: `expo-image-picker`

`ImagePickerService` gives the application access to the camera and image gallery.

Public methods:
- `getImage` - initializes the application (camera or gallery) and returns a result containing an image.
- `launchGallery` - launches the gallery application and returns a result containing the selected images.
- `launchCamera` - launches the camera application and returns the taken photo.
- `requestGalleryAccess` - requests the application access to the gallery.
- `requestCameraAccess` - requests the application access to the camera.
- `getFormData` - creates a [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object with image.

**Example**

Pick image and send request:

```ts
import { imagePickerService, ImagePickerSource } from '@ronas-it/react-native-common-modules';

const handlePickImage = async (source: ImagePickerSource) => {
  const image = await imagePickerService.getImage(source);
  const asset = image?.assets?.[0];

  if (!asset) {
    return;
  }

  const data = imagePickerService.getFormData(asset.uri);

  // API call
  createMedia(data);
};
```

#### 4. WebSocket

> **_NOTE:_** Required dependencies: `@pusher/pusher-websocket-react-native`, `pusher-js`

`WebSocketService` manages WebSocket connections using [Pusher](https://pusher.com/) and can work in both web and mobile applications.
Doesn't support Expo Go.

It's necessary to install [@pusher/pusher-websocket-react-native](https://github.com/pusher/pusher-websocket-react-native)
for a mobile app and [pusher-js](https://github.com/pusher/pusher-js) for a web app.

Options for `WebSocketService` constructor:

- `apiKey` (required) - `APP_KEY` from [Pusher Channels Dashboard](https://dashboard.pusher.com/).
- `cluster` (required) - `APP_CLUSTER` from [Pusher Channels Dashboard](https://dashboard.pusher.com/).
- `authURL` (optional) - a URL that returns the authentication signature needed for private channels.
- `useTLS` (optional) - a flag that indicates whether TLS encrypted transport should be used. Default value is `true`.
- `activityTimeout` (optional) - time in milliseconds to ping a server after last message.
- `pongTimeout` (optional) - time in milliseconds to wait a response after a pinging request.

`WebSocketService` public methods:

- `connect` initializes and connects the Pusher client. Optional authorization token is used for secure connections.
- `subscribeToChannel` subscribes to a specified channel and registers an event listener for incoming messages on that channel.
- `unsubscribeFromChannel` removes an event listener and, if there is no listeners for a specified channel, unsubscribes from it.

**Example:**

```ts
import { WebSocketService } from '@ronas-it/react-native-common-modules';

// Create a service instance
type ChannelName = `private-conversations.${number}` | `private-users.${number}`;
const webSocketService = new WebSocketService<ChannelName>({
  apiKey: '1234567890qwertyuiop',
  cluster: 'eu',
  authURL: 'https://your-api.com/api/v1/broadcasting/auth'
});

// Initialize Pusher, e.g. after an app initialization or successful authorization
await webSocketService.connect('your-auth-token');

// Subscribe to a channel when it's necessary
webSocketService.subscribeToChannel('private-conversations.123', (event) => {
  console.log('Received event:', event);
});

// Unsubscribe from a channel, e.g. before an app closing or logging out
webSocketService.unsubscribeFromChannel('private-conversations.123', (event) => {
  console.log('Received event:', event);
});
```

### Utils

#### 1. `setupReactotron(projectName: string)`

> **_NOTE:_** Required dependencies: `@reduxjs/toolkit`, `reactotron-react-native`, `reactotron-react-js`, `reactotron-redux`, `@react-native-async-storage/async-storage`

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

#### 2. `i18n`

> **_NOTE:_** Required dependencies: `i18n-js`, `expo-localization`

Provides functions to set language and use translations using [i18n-js](https://github.com/fnando/i18n-js)

**Example:**

root layout:

```ts
import { setLanguage } from '@ronas-it/react-native-common-modules';

const translations = {
  en: {
    ...require('i18n/example/en.json')
  },
  fr: {
    ...require('i18n/example/fr.json')
  }
};

const useLanguage = setLanguage(translations, 'en');

interface LanguageContextProps {
  language: string;
  onLanguageChange?: (language: keyof typeof translations) => void;
}

export const LanguageContext = createContext<LanguageContextProps>({ language: 'en' });

function App(): ReactElement {
  return (
    <Stack>
      <Stack.Screen name='index' />
    </Stack>
  );
}

export default function RootLayout(): ReactElement | null {
  const [language, setLanguage] = useState<keyof typeof translations>('en');

  useLanguage(language);

  return (
    <LanguageContext.Provider value={{ language, onLanguageChange: setLanguage }}>
      <App />
    </LanguageContext.Provider>
  );
}
```

screen:

```ts
import { AppPressable, AppSafeAreaView, useTranslation } from '@ronas-it/react-native-common-modules';
import { ReactElement, useContext } from 'react';
import { View, Text, Alert } from 'react-native';
import { LanguageContext } from './_layout';

export default function RootScreen(): ReactElement {
  const translate = useTranslation('EXAMPLE');
  const { language, onLanguageChange } = useContext(LanguageContext);

  const onPress = () => Alert.alert(translate('TEXT_PRESSED'));

  const handleLanguageChange = (): void => {
    onLanguageChange?.(language === 'en' ? 'fr' : 'en');
  };

  return (
    <AppSafeAreaView edges={['bottom']} style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <AppPressable onPress={onPress} hitSlop={10}>
        <Text>{translate('BUTTON_PRESS_ME')}</Text>
        </AppPressable>
        <AppPressable onPress={handleLanguageChange} hitSlop={10}>
          <Text>{translate('BUTTON_LANGUAGE')}</Text>
        </AppPressable>
      </View>
    </AppSafeAreaView>
  );
}
```
