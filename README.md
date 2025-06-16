# React Native Common Modules

Common components for Ronas IT projects.

## Development

### Use example app

1. Install dependencies: `npm install`
2. Start app for local development: `cd apps/example && npx expo start`
3. Use [Expo Go](https://expo.dev/client) to run mobile version

### Release

To publish the package update to NPM, run:

```sh
npx nx run lib:nx-release-publish
```

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
import { AppPressable } from '@ronas-it/react-native-common-modules/src/ui/pressable';

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
import { AppSafeAreaView } from '@ronas-it/react-native-common-modules/src/ui/safe-area-view';

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
import { VirtualizedList, VirtualizedListProps } from '@ronas-it/react-native-common-modules/src/ui/virtualized-scroll';

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
import { usePushNotifications } from '@ronas-it/react-native-common-modules/src/data-access/push-notifications';

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
import { AsyncStorageItem, SecureStorageItem } from '@ronas-it/react-native-common-modules/src/data-access/storage';

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
import { imagePickerService, ImagePickerSource } from '@ronas-it/react-native-common-modules/src/data-access/image-picker';

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
import { WebSocketService } from '@ronas-it/react-native-common-modules/src/data-access/websocket';

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
import { setupReactotron } from '@ronas-it/react-native-common-modules/src/data-access/store/utils/reactotron';

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
import { setLanguage } from '@ronas-it/react-native-common-modules/src/utils/i18n';

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
import { AppPressable } from '@ronas-it/react-native-common-modules/src/ui/pressable';
import { AppSafeAreaView } from '@ronas-it/react-native-common-modules/src/ui/safe-area-view';
import { useTranslation } from '@ronas-it/react-native-common-modules/src/utils/i18n';
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

### Features

#### 1. Clerk

> **_NOTE:_**   Required dependencies: `@clerk/clerk-expo`

Hooks and helpers to create user authentication with [Clerk Expo SDK](https://clerk.com/docs/references/expo/overview).

#### `useClerkResources`

Hook, that provides access to essential Clerk methods and objects.

Returned Object:

- `signUp` - provides access to [SignUp](https://clerk.com/docs/references/javascript/sign-up) object.
- `signIn` - provides access to [SignIn](https://clerk.com/docs/references/javascript/sign-in) object.
- `setActive` - A function that sets the active session.
- `signOut` - A function that signs out the current user.

#### `useAuthWithIdentifier`

Hook, that provides functionality to handle user sign-up and sign-in processes using an identifier such as an email, phone number, or username. It supports both OTP (One Time Password) and password-based authentication methods.

Parameters:

- `method`: Specifies the type of identifier used for authentication (e.g., 'emailAddress', 'phoneNumber', 'username').
- `verifyBy`: Specifies the verification method ('otp' for one-time passwords or 'password').

Returned Object:

- `startSignUp`: Initiates a new user registration using the specified identifier and verification method.
- `startSignIn`: Initiates authentication of an existing user using the specified identifier and verification method.
- `startAuthorization`: Determines whether to initiate a sign-up or sign-in based on whether the user has been registered previously.
- `verifyCode`: Verifies an OTP code if the verification method is 'otp'.
- `isLoading:` Indicates whether an authentication request is in progress.
- `isVerifying`: Indicates whether an OTP verification is in progress.

**Example:**

```ts
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { useAuthWithIdentifier } from '@ronas-it/react-native-common-modules/src/features/clerk';

export const AuthWithIdentifierComponent = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const { startSignUp, verifyCode, isLoading, isVerifying } = useAuthWithIdentifier('emailAddress', 'otp');

  const handleSignUp = async () => {
    await startSignUp({ identifier, password });
  };

  const handleVerifyCode = async () => {
    const result = await verifyCode({ code: otp });
    console.log(result.sessionToken)
  };

  return (
    <View>
      <TextInput
        placeholder="Enter your email"
        value={identifier}
        onChangeText={setIdentifier}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Enter verification code"
        value={verificationCode}
        onChangeText={setVerificationCode}
      />
      <Button onPress={handleSignUp} title="Sign Up" disabled={isLoading || isVerifying} />
      <Button onPress={handleVerifyCode} title="Verify code" disabled={isLoading || isVerifying} />
    </View>
  );
};

```

#### `useAuthWithSSO`

Hook provides functionality to handle [SSO](https://clerk.com/docs/references/expo/use-sso) authentication flows.

Returned Object:

- `startSSOFlow`: A function to initiate an SSO flow. It takes a strategy, redirectUrl, and optional tokenTemplate as parameters, starting the SSO authentication and returning session information or errors upon completion.
- `isLoading`: A boolean indicating whether an SSO process is currently ongoing.

#### `useAuthWithTicket`

This hook is a utility that facilitates user authentication using a ticket-based strategy (ticket is a token generated from the Backend API).

Returned Object:

- `startAuthorization`: A function to initiate authentication with a ticket. It accepts an object with ticket and optional tokenTemplate parameters to kick off the authorization process and returns the session details.
- `isLoading`: A boolean indicating whether the ticket-based authorization process is ongoing.

#### `useGetSessionToken`

This hook is a utility for getting session tokens.

Returned Object:

- `getSessionToken`: A function to retrieve the session token. It takes an optional [tokenTemplate](https://clerk.com/docs/backend-requests/jwt-templates) parameter to specify a template for the token.

#### `useAddIdentifier`

Hook provides functionality to add new email or phone number identifiers to a user's account and verify them using verification codes.

Returned Object:

- `createIdentifier`: A function to add a new email or phone number identifier to the user's account and prepare it for verification.
- `verifyCode`: A function to verify a code sent to the identifier, completing the verification process.
- `isCreating`: A boolean indicating whether an identifier is currently being added.
- `isVerifying`: A boolean indicating whether a verification code is currently being processed.

#### `useOtpVerification`

Hook provides functionality for managing OTP (One Time Password) verification in user authentication workflows, supporting both sign-up and sign-in processes.

Returned Object:

- `sendOtpCode`: Sends an OTP code to the user's identifier (email or phone number) based on the specified strategy.
- `verifyCode`: Verifies the OTP code provided by the user, completing the authentication process.
- `isVerifying`: A boolean indicating whether a verification attempt is currently in progress.

#### `useResetPassword`

Hook provides a methods to handle password reset functionality through email or phone-based OTP.

Returned Object:

- `startResetPassword`: A function to initiate the password reset process by sending a verification code to the user's email or phone number.
- `resetPassword`: A function to reset the user's password by verifying the code and setting a new password.
- `isCodeSending`: A boolean indicating if the verification code is being sent.
- `isResetting`: A boolean indicating if the password is being reset.
