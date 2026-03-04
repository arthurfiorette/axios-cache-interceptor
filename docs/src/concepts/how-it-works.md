# How It Works

High-level architecture and request flow of axios-cache-interceptor.

## Overview

axios-cache-interceptor sits between your application and the network, intercepting axios requests to provide intelligent caching.

## Architecture

```
Your Code
    ↓
axios.get('/api/users')
    ↓
Request Interceptor
    ├→ Generate cache key
    ├→ Check storage
    ├→ Return cached (if valid)
    └→ Continue to network (if needed)
    ↓
Network Request
    ↓
Response Interceptor
    ├→ Interpret headers
    ├→ Test cache predicate
    ├→ Store in cache
    └→ Resolve waiting requests
    ↓
Your Code receives response
```

## Key Components

**Interceptors:**
- Request interceptor: Checks cache before network
- Response interceptor: Stores responses in cache

**Storage:**
- In-memory (default)
- localStorage/sessionStorage
- Custom adapters (Redis, IndexedDB, etc.)

**Cache Key Generator:**
- Creates unique IDs for each request
- Uses method, URL, params, data, headers

**Header Interpreter:**
- Parses Cache-Control, Expires, Age
- Determines TTL from server headers

## Request Flow

**Cache Hit (Fastest):**
1. Request interceptor generates cache key
2. Checks storage, finds valid cache
3. Returns cached response immediately
4. No network request made

**Cache Miss:**
1. Request interceptor generates cache key
2. Checks storage, finds no cache
3. Allows request to continue to network
4. Response interceptor caches the result

**Concurrent Requests (Deduplication):**
1. First request starts, sets state to "loading"
2. Second identical request sees "loading" state
3. Second request waits for first to complete
4. Both receive same result
5. Only one network request made

**Stale Revalidation:**
1. Request finds stale cache
2. Returns stale data immediately (if configured)
3. Makes background request for fresh data
4. Updates cache when fresh data arrives

## Storage States

Every cache entry has one of these states:

**empty** - No cached data exists
**cached** - Valid cached data within TTL
**stale** - Expired data that can be revalidated
**loading** - Request in progress
**must-revalidate** - Cache-Control: must-revalidate header present

## Default Behavior

Without any configuration, the library:
- Caches GET and HEAD requests
- Uses in-memory storage
- Sets 5-minute TTL
- Respects HTTP caching headers
- Enables ETag revalidation
- Deduplicates concurrent requests

## Next Steps

- [Request Lifecycle](/concepts/request-lifecycle.md) - Detailed request flow
- [Storage States](/concepts/storage-states.md) - State machine explained
- [Request Deduplication](/concepts/request-deduplication.md) - How concurrent requests work
