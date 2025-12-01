## WebSocket Service Update

**Breaking change**: `WebSocketService` now requires calling `init()` before `connect()`. The `init()` method accepts a token getter function for dynamic token retrieval, ensuring the latest authentication token is always used.

**Migration**:

```ts
// Before
await webSocketService.connect('your-auth-token');

// After
const tokenGetter = () => getAuthToken(); // Function that returns current token
await webSocketService.init(tokenGetter);
webSocketService.connect();
```
