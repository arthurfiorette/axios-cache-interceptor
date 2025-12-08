# Cache States & Transitions

This diagram shows all possible cache states and how they transition from one to another.

```mermaid
stateDiagram-v2
    [*] --> empty: Initial state
    
    empty --> loading: First request starts
    
    loading --> cached: Server responds successfully<br/>& cache predicate passes<br/>& headers allow caching
    loading --> empty: Server responds but<br/>cache predicate fails OR<br/>headers say dont cache OR<br/>request cancelled
    loading --> loading: Concurrent request waits
    
    cached --> empty: Cache deleted manually<br/>OR storage.remove() called
    cached --> stale: TTL expires<br/>(createdAt + ttl < now)
    cached --> must_revalidate: Cache-Control: must-revalidate<br/>& TTL expires
    
    stale --> loading: Request with stale data<br/>Adds If-None-Match/If-Modified-Since headers
    stale --> cached: Request succeeds with new data
    stale --> stale: staleIfError triggers<br/>on request error
    stale --> empty: Cache deleted
    
    must_revalidate --> loading: Revalidation request starts<br/>Adds If-None-Match/If-Modified-Since headers
    must_revalidate --> cached: Revalidation succeeds<br/>(200 or 304 response)
    must_revalidate --> empty: Revalidation fails<br/>& no staleIfError
    must_revalidate --> stale: Revalidation fails<br/>& staleIfError allows
    
    loading --> stale: Previous state was stale<br/>& staleTtl is still valid
    
    note right of empty
        No cached data
        No TTL
        No createdAt
    end note
    
    note right of cached
        Has data
        Has TTL
        Has createdAt
        Response returned from cache
        No HTTP request made
    end note
    
    note right of stale
        Has data (old)
        TTL expired
        Has createdAt (old)
        Can be used with staleIfError
        Request made with conditional headers
    end note
    
    note right of must_revalidate
        Has data
        Must revalidate with server
        Cannot use without revalidation
        Requires fresh validation
    end note
    
    note right of loading
        Request in progress
        May have previous data
        Has deferred promise
        Other requests wait for this
        Can have previous: 'empty', 'stale', or 'must-revalidate'
    end note
```

## State Descriptions

### empty
- **Data**: None
- **TTL**: None
- **Usage**: Initial state or after cache deletion
- **Next Actions**: First request will transition to `loading`

### cached
- **Data**: Fresh cached response
- **TTL**: Active (not expired)
- **Usage**: Response returned immediately from cache without network request
- **Next Actions**: 
  - Expires to `stale` when TTL runs out
  - Can transition to `must_revalidate` if Cache-Control requires it
  - Can be deleted manually to `empty`

### stale
- **Data**: Expired cached response
- **TTL**: Expired
- **Usage**: Can be returned with `staleIfError` on failures
- **Next Actions**: 
  - Next request transitions to `loading` with conditional headers (If-None-Match, If-Modified-Since)
  - Server may respond with 304 Not Modified (data unchanged) or 200 OK (new data)

### must-revalidate
- **Data**: Cached response requiring revalidation
- **TTL**: Expired with must-revalidate directive
- **Usage**: Cannot be used without server validation
- **Next Actions**: Must transition to `loading` for revalidation

### loading
- **Data**: May have previous stale data
- **TTL**: None (request in progress)
- **Usage**: Request is currently being made to server
- **Special**: 
  - Has deferred promise that other concurrent requests wait on
  - Tracks previous state (empty, stale, or must-revalidate)
  - May hydrate UI with stale data while loading
- **Next Actions**: Resolves to `cached` on success or `empty` on failure

## Common Transitions

### First Request (Cache Miss)
```
empty → loading → cached
```

### Cache Hit
```
cached (returns immediately, no state change)
```

### Cache Expiration
```
cached → stale → loading → cached
```

### Revalidation with 304 Not Modified
```
stale → loading → cached (with old data, updated TTL)
```

### Error with staleIfError
```
stale → loading → stale (error occurred, stale data returned)
```
