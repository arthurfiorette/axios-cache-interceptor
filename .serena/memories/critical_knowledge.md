# Critical Knowledge for Working with Axios Cache Interceptor

This document contains essential insights for AI assistants working on this codebase. Read this first!

## Most Important Files

### 1. `src/interceptors/request.ts` - THE MOST COMPLEX FILE

This is where 80% of the complexity lives. Understanding this file is key to understanding the library.

**What it does:**

- Generates cache keys (Request IDs)
- Handles concurrent request deduplication via `waiting` Map
- Detects Vary header mismatches and switches cache keys mid-flight
- Manages storage state transitions (empty → loading → cached/stale)
- Adds conditional headers for revalidation (If-None-Match, If-Modified-Since)
- Injects custom adapter to return cached data without network call

**Critical sections:**

- Lines handling `axios.waiting` Map (deferred promise coordination)
- Vary mismatch detection (switches from custom ID to generated key)
- The `ignoreAndRequest` label (uses labeled break statement)

### 2. `src/interceptors/response.ts` - Second Most Important

Handles both successful responses AND errors.

**What it does:**

- Tests if response should be cached (cachePredicate)
- Interprets headers to determine TTL
- Stores cache metadata (ETag, Last-Modified, Vary)
- Resolves/rejects all waiting concurrent requests
- Implements stale-if-error logic

**Critical sections:**

- `replyDeferred()` function (must always clean up waiting Map)
- Error interceptor (onRejected) handles stale-if-error
- Vary: \* handling (immediately marks as stale)

### 3. `src/storage/types.ts` - The Contract

Defines the state machine that all storage must follow. This is the single source of truth.

**Storage states:**

- `empty` - Nothing cached
- `cached` - Valid cache within TTL
- `stale` - Expired but can revalidate
- `must-revalidate` - Stricter than stale
- `loading` - Request in progress (tracks previous state)

## Critical Concepts

### Request Deduplication

**Problem:** Multiple concurrent identical requests waste network and server resources.

**Solution:** First request sets state to `loading` and creates a `Deferred` promise in `waiting` Map. Subsequent identical requests wait on this promise instead of making their own network call.

**Code location:** `src/interceptors/request.ts` - search for `axios.waiting`

**Edge cases:**

- Storage eviction during loading (handled gracefully)
- Request cancellation (must reject deferred)
- Vary mismatch after waiting (must make own request)

### Vary Header Support

**Problem:** Server uses `Vary: Authorization` but cache key doesn't include auth header → cache poisoning (User A sees User B's data).

**Solution:** When response has Vary header, extract specified request headers and include in cache key. Different header values = different cache entries.

**Code locations:**

- `src/header/extract.ts` - Extracts headers by name
- `src/interceptors/request.ts` - Detects mismatches, switches keys
- `src/interceptors/response.ts` - Stores vary metadata

**Edge cases:**

- `Vary: *` (marks as immediately stale)
- Concurrent requests with different vary headers (each gets own cache)
- Custom IDs with vary (ID gets overridden with generated key)
- **undefined vs missing headers** (both treated as undefined - this is correct!)

### Storage State Machine

Every cache entry transitions through states. Understanding these transitions is essential.

**Transitions:**

```
empty → loading (previous: empty) → cached
cached → (TTL expires) → stale
stale → loading (previous: stale) → cached (304) or cached (200)
cached → (Cache-Control: must-revalidate) → must-revalidate
* → (error) → stale (if staleIfError enabled)
```

**Important:** Loading state tracks `previous` to know what to do if request fails.

## Common Bugs and How to Avoid Them

### Bug: Forgetting to Resolve/Reject Deferred

**Symptom:** Requests hang forever.
**Cause:** `waiting` Map has promise that never resolves.
**Fix:** Every code path must call `replyDeferred()` or manually resolve/reject.
**Prevention:** Search codebase for all `waiting.get()` and ensure cleanup.

### Bug: Cache Poisoning with Vary

**Symptom:** User A sees User B's data.
**Cause:** Disabled `vary: false` or vary not working correctly.
**Fix:** Keep vary enabled (default), test with different headers.
**Prevention:** Never disable vary unless absolutely necessary. Add tests with different headers.

### Bug: Memory Leak from Stale Entries

**Symptom:** Memory grows unbounded.
**Cause:** Stale entries with ETag never expire and accumulate.
**Fix:** Use `maxStaleAge` parameter in storage.
**Prevention:** Always set `maxStaleAge` for long-running processes.

### Bug: Mutating Cached Data

**Symptom:** Cached response mysteriously changes.
**Cause:** Direct mutation of response object that's also in cache.
**Fix:** Use `cloneData: true` in memory storage.
**Prevention:** Document that users should not mutate responses, or use cloning by default.

### Bug: Hash Collisions in Persistent Storage

**Symptom:** Random cache hits for unrelated requests.
**Cause:** Default 32-bit hash has collision probability at ~77k keys.
**Fix:** Use cryptographic hash (SHA256) for persistent storage.
**Prevention:** Warn users about collision risk in docs, provide custom generator example.

## Testing Guidelines

### Always Test Concurrent Scenarios

Many bugs only appear with concurrent requests. Use `Promise.all()` liberally.

```typescript
const [resp1, resp2, resp3] = await Promise.all([
  axios.get('url'),
  axios.get('url'),
  axios.get('url')
]);
```

### Always Validate Storage State

Don't just check response properties - verify storage state too.

```typescript
const cache = await axios.storage.get(response.id);
assert.equal(cache.state, 'cached');
assert.ok(cache.data);
```

### Test Vary Header Edge Cases

Vary is complex and error-prone. Test these scenarios:

- Same headers (cache hit)
- Different headers (cache miss)
- Missing vs undefined headers (same key)
- Concurrent with different headers (separate caches)
- Custom ID with vary (key switching)
- Vary: \* (immediate stale)

### Test Error Paths

Don't just test happy path. Test:

- Network errors (stale-if-error)
- Invalid status codes (cachePredicate)
- Request cancellation (deferred rejection)
- Storage eviction during loading (graceful handling)

## Performance Hot Paths

### Critical for Performance:

1. **Key generation** - Called for every request (use fast hash)
2. **Storage lookup** - Called multiple times per request (O(1) required)
3. **Vary comparison** - Called when vary headers present (keep O(n) small)
4. **Deferred coordination** - Creates promises for concurrent requests (use efficient implementation)

### Less Critical:

- Header interpretation (only on cache miss)
- Cache predicate (only on cache miss)
- Storage serialization (depends on storage backend)

## Debugging Workflow

### When User Reports Bug:

1. **Ask for debug logs**

   ```typescript
   import { setupCache } from 'axios-cache-interceptor/dev';
   const axios = setupCache(instance, { debug: console.log });
   ```

2. **Look for these key messages:**
   - "Cache disabled" - Check enabled flag, methods, ignoreUrls
   - "Vary mismatch" - Check header consistency across requests
   - "Cache header interpreted as 'dont cache'" - Server headers override config
   - "Concurrent request detected" - Verify deduplication working
   - "staleIfError: returning stale cache" - Error handling active

3. **Common user mistakes:**
   - Inconsistent headers with vary enabled
   - Server sends `Cache-Control: no-cache` but user expects caching
   - Method not in `cache.methods` array
   - Custom cache predicate too restrictive
   - Using custom ID with vary (doesn't expect key switching)

4. **Check storage state:**
   ```typescript
   const cache = await axios.storage.get(requestId);
   console.log(cache.state, cache.data?.meta);
   ```

## Architecture Decisions

### Why Deferred Promises?

Using `fast-defer` library for request coordination. Better performance than `new Promise()` with explicit resolve/reject tracking.

### Why Map for Storage?

O(1) lookup is essential for performance. Users can implement any backend but must return in O(1) or O(log n).

### Why 32-bit Hash?

Fast and good enough for in-memory storage. Users with persistent storage should use stronger hash.

### Why Axios Interceptors?

Non-invasive, works with existing axios code. Users can add cache without changing request code.

### Why State Machine?

Clear transitions, prevents invalid states, easy to reason about storage backends.

## References

- **RFC 7231** - HTTP/1.1 Semantics (cacheability)
- **RFC 7232** - HTTP/1.1 Conditional Requests (ETag, Last-Modified)
- **RFC 7234** - HTTP/1.1 Caching (Cache-Control)
- **RFC 9110** - HTTP Semantics (Vary: \*)

## Quick Reference

### Check if feature exists:

1. Search CLAUDE.md (comprehensive guide)
2. Check docs/src/ (user documentation)
3. Read tests (best examples)
4. Check types (TypeScript shows all options)

### Find implementation:

1. Search for type definition (leads to implementation)
2. Check interceptors (most logic here)
3. Look in util/ (helper functions)
4. Check storage/ (backend-specific)

### Understand flow:

1. Start at setupCache() (src/cache/create.ts)
2. Follow to request interceptor (src/interceptors/request.ts)
3. Then response interceptor (src/interceptors/response.ts)
4. Check storage implementation (src/storage/)

---

**Remember:** When in doubt, enable debug logging and read the output. The library is designed to explain its decisions through debug messages.
