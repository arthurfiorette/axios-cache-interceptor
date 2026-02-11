# Request Deduplication

How axios-cache-interceptor handles concurrent identical requests.

## The Problem

Without deduplication:

```ts
// Two components fetch the same data simultaneously
await Promise.all([
  axios.get('/api/users'), // Request 1
  axios.get('/api/users')  // Request 2
]);
// Result: 2 network requests for identical data
```

## The Solution

With axios-cache-interceptor:

```ts
const [res1, res2] = await Promise.all([
  axios.get('/api/users'), // Request 1: goes to network
  axios.get('/api/users')  // Request 2: waits for request 1
]);

console.log(res1.cached); // false
console.log(res2.cached); // true
// Result: 1 network request, both get same data
```

## How It Works

### Step 1: First Request Starts

```ts
// Request 1 arrives
await axios.get('/api/users');

// Interceptor sets state to 'loading'
storage.set(requestId, {
  state: 'loading',
  previous: 'empty'
});

// Creates deferred promise
waiting.set(requestId, deferred);
```

### Step 2: Second Request Arrives

```ts
// Request 2 with same URL arrives
await axios.get('/api/users');

// Interceptor sees state is 'loading'
const cache = await storage.get(requestId);
// cache.state === 'loading'

// Gets deferred promise from waiting map
const deferred = waiting.get(requestId);

// Waits for promise to resolve
await deferred.promise;
```

### Step 3: First Request Completes

```ts
// Response arrives for request 1
// Interceptor stores cache
storage.set(requestId, {
  state: 'cached',
  data: response,
  ttl: 300000,
  createdAt: Date.now()
});

// Resolves deferred promise
deferred.resolve(response);

// Cleans up waiting map
waiting.delete(requestId);

// Both requests now have the response
```

## Waiting Map

The waiting map coordinates concurrent requests:

```ts
// Internal structure (simplified)
const waiting = new Map<string, Deferred>();

interface Deferred {
  promise: Promise<Response>;
  resolve: (value: Response) => void;
  reject: (error: Error) => void;
}
```

## Request ID Matching

Requests are considered identical if they have the same:
- HTTP method
- Base URL
- URL path
- Query parameters
- Request body
- Vary headers (if applicable)

Different request IDs = separate requests:

```ts
// Different cache keys
const [res1, res2] = await Promise.all([
  axios.get('/api/users?page=1'), // ID: "123456"
  axios.get('/api/users?page=2')  // ID: "789012"
]);
// Result: 2 network requests (different pages)
```

## Error Handling

If first request fails, all waiting requests fail:

```ts
const [res1, res2] = await Promise.all([
  axios.get('/api/broken'), // Fails with 500
  axios.get('/api/broken')  // Also fails with same error
]).catch(error => {
  // Both requests receive the same error
  console.log('Both failed:', error);
});
```

## Cancellation

If first request is cancelled:

```ts
const controller = new AbortController();

Promise.all([
  axios.get('/api/users', { signal: controller.signal }),
  axios.get('/api/users')
]);

// Cancel first request
controller.abort();

// Second request continues and makes its own network call
```

## Performance Benefits

**Without deduplication:**
- N concurrent requests = N network calls
- N server loads
- N bandwidth usage

**With deduplication:**
- N concurrent requests = 1 network call
- 1 server load
- 1x bandwidth usage
- Subsequent requests served instantly

## Real-World Example

React components mounting simultaneously:

```tsx
function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/api/user').then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}

// Multiple instances mount at once
<App>
  <UserProfile /> {/* Request 1 */}
  <UserProfile /> {/* Request 2: deduplicated */}
  <UserProfile /> {/* Request 3: deduplicated */}
</App>

// Result: Only 1 network request made
```

## Debug Output

Enable debug mode to see deduplication:

```ts
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(instance, {
  debug: console.log
});

// Concurrent requests
await Promise.all([
  axios.get('/api/users'),
  axios.get('/api/users')
]);

// Debug output:
// [123456] Cache miss
// [123456] Making network request
// [123456] Concurrent request detected, waiting
// [123456] Response cached
// [123456] Resolving 1 waiting request(s)
```

## Next Steps

- [Storage States](/concepts/storage-states.md) - Loading state explained
- [Request Lifecycle](/concepts/request-lifecycle.md) - Complete flow
- [Cache Keys](/concepts/cache-keys.md) - How IDs are generated
