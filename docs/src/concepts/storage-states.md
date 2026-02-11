# Storage States

Understanding the cache state machine and state transitions.

## State Overview

Every cache entry exists in one of these states:

```
empty → loading → cached → stale → loading → cached ...
         ↓
      (concurrent)
         ↓
       cached
```

## State Definitions

### empty

**Meaning:** No cached data exists

**When it occurs:**
- First time requesting this resource
- After cache entry deleted
- After cache.clear()

**What happens:**
- Request proceeds to network
- State changes to `loading`

### cached

**Meaning:** Valid fresh data within TTL

**When it occurs:**
- After successful network response
- After successful 304 Not Modified revalidation

**What happens:**
- Data returned immediately
- No network request made
- `response.cached = true`

### stale

**Meaning:** Data exists but TTL expired

**When it occurs:**
- After TTL expires
- After Cache-Control: must-revalidate received

**What happens:**
- Data can be revalidated with ETag/If-Modified-Since
- Or returned if staleIfError configured
- Or new request made

### loading

**Meaning:** Network request in progress

**When it occurs:**
- Request sent to network
- Waiting for response

**What happens:**
- Subsequent identical requests wait
- Deferred promise created
- State transitions to `cached` or `stale` after response

## State Transitions

### empty → loading

**Trigger:** First request for this resource

```ts
// Before request
state: 'empty'

// After request starts
state: 'loading'
previous: 'empty'
```

### loading → cached

**Trigger:** Successful response received

```ts
// During request
state: 'loading'

// After response
state: 'cached'
data: response
ttl: 300000
createdAt: Date.now()
```

### cached → stale

**Trigger:** TTL expires

```ts
// Within TTL
state: 'cached'
createdAt: 1640000000000
ttl: 300000

// After 5 minutes
state: 'stale'
createdAt: 1640000000000 // unchanged
ttl: 300000              // unchanged
```

### stale → loading

**Trigger:** Revalidation request

```ts
// Before revalidation
state: 'stale'

// During revalidation
state: 'loading'
previous: 'stale' // Important: preserves old data
```

### stale → cached (304)

**Trigger:** 304 Not Modified response

```ts
// Server says data unchanged
// Keep data, update timestamps
state: 'cached'
data: existingData // unchanged
ttl: newTTL
createdAt: Date.now()
```

## Loading State Variants

The `loading` state tracks what it's loading from:

```ts
// First request
{ state: 'loading', previous: 'empty' }

// Revalidating stale
{ state: 'loading', previous: 'stale' }

// Revalidating must-revalidate
{ state: 'loading', previous: 'must-revalidate' }
```

This helps determine:
- Whether to call hydrate callback
- Whether to use stale data on error
- How to handle concurrent requests

## Code Examples

### Checking State

```ts
const response = await axios.get('/api/users');
const cache = await axios.storage.get(response.id);

switch (cache.state) {
  case 'empty':
    console.log('No cache exists');
    break;
  case 'cached':
    console.log('Fresh cache:', cache.data);
    break;
  case 'stale':
    console.log('Stale cache:', cache.data);
    break;
  case 'loading':
    console.log('Request in progress, previous:', cache.previous);
    break;
}
```

### Manually Setting State

```ts
// Force cache to stale
const cache = await axios.storage.get(requestId);
if (cache.state === 'cached') {
  await axios.storage.set(requestId, {
    ...cache,
    state: 'stale'
  });
}

// Delete cache (set to empty)
await axios.storage.remove(requestId);
```

## State Machine Diagram

```
┌─────────┐
│  empty  │
└────┬────┘
     │ Request starts
     ↓
┌─────────┐
│ loading │←─────────┐
└────┬────┘          │
     │ Response      │ Revalidation
     ↓               │
┌─────────┐    ┌─────┴────┐
│ cached  │───→│  stale   │
└─────────┘    └──────────┘
     TTL expires
```

## Next Steps

- [Request Lifecycle](/concepts/request-lifecycle.md) - See states in action
- [Request Deduplication](/concepts/request-deduplication.md) - Loading state behavior
- [Storage Interface](/api/storage-interface.md) - Implementing storage
