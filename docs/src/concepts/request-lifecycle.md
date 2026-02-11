# Request Lifecycle

Detailed flow of a request through axios-cache-interceptor.

## Complete Request Flow

### 1. User Makes Request

```ts
const response = await axios.get('/api/users');
```

### 2. Request Interceptor Runs

**Step 2.1: Configuration Check**
- Is caching enabled? (`cache.enabled`)
- Is method cacheable? (`cache.methods`)
- URL filters applied (`ignoreUrls`, `allowUrls`)

**Step 2.2: Generate Request ID**
- Hash method, URL, params, data
- Include Vary headers if needed
- Assign to `config.id`

**Step 2.3: Check Storage**
```ts
const cached = await storage.get(requestId);
```

**Step 2.4: Handle Based on State**

**If `state === 'empty'`:**
- Set state to `loading`
- Create deferred promise in waiting map
- Continue to network

**If `state === 'cached'`:**
- Return cached response immediately
- Skip network request
- Set `response.cached = true`

**If `state === 'stale'`:**
- Call `hydrate(cache)` if configured
- Add revalidation headers (If-None-Match, If-Modified-Since)
- Continue to network

**If `state === 'loading'`:**
- Another request is in progress
- Wait for deferred promise
- Return when first request completes

### 3. Network Request (if not cached)

Standard axios request to the server.

### 4. Response Interceptor Runs

**Step 4.1: Check if Already Cached**
- If request interceptor returned cache, skip storage

**Step 4.2: Update Other Caches**
- Process `cache.update` configuration
- Delete or modify related cache entries

**Step 4.3: Test Cache Predicate**
- Check status code
- Check headers
- Check response data
- Determine if response is cacheable

**Step 4.4: Interpret Headers**
- Parse Cache-Control, Expires, Age
- Calculate TTL
- Extract ETag, Last-Modified, Vary

**Step 4.5: Store in Cache**
```ts
await storage.set(requestId, {
  state: 'cached',
  data: response,
  ttl: calculatedTTL,
  createdAt: Date.now()
});
```

**Step 4.6: Resolve Waiting Requests**
- Get deferred promise from waiting map
- Resolve with response data
- Clear from waiting map

### 5. Response Returned

User receives response with additional properties:
- `response.cached` - boolean
- `response.stale` - boolean
- `response.id` - cache key

## Special Cases

### 304 Not Modified

When server returns 304:
1. Keep existing cached data
2. Update TTL and timestamps
3. Return cached data to user

### Request Cancellation

When user cancels request:
1. Remove from waiting map
2. Reject deferred promises
3. Don't update cache

### Vary Header Mismatch

When Vary headers don't match:
1. Detect mismatch during request
2. Generate new cache key with correct headers
3. Check storage again
4. Continue with new key

## Performance Characteristics

**Cache Hit:**
- Time: ~1ms (memory lookup)
- Network: 0 requests
- CPU: Minimal (hash + lookup)

**Cache Miss:**
- Time: Network latency + cache overhead
- Network: 1 request
- CPU: Hash + lookup + storage write

**Concurrent Deduplication:**
- Time: First request latency
- Network: 1 request (not N)
- CPU: Minimal (promise coordination)

## Next Steps

- [Storage States](/concepts/storage-states.md) - Understand state transitions
- [Request Deduplication](/concepts/request-deduplication.md) - Concurrent request handling
- [HTTP Caching Headers](/concepts/http-caching-headers.md) - Header interpretation
