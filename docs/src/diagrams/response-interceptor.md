# Response Interceptor Flow

This diagram shows the detailed flow through the response interceptor for successful responses.

```mermaid
flowchart TB
    Start([Response Interceptor Entry<br/>onFulfilled]) --> CheckConfig{response.config<br/>exists?}
    
    CheckConfig -->|No| Debug1[Debug: 'Response interceptor received unknown response']
    Debug1 --> ThrowError1[Re-throw response as error]
    
    CheckConfig -->|Yes| SetId[Set response.id from config.id<br/>Set response.cached default to false]
    SetId --> IsCached{response.cached<br/>=== true?}
    
    IsCached -->|Yes| Debug2[Debug: 'Returned cached response']
    Debug2 --> ReturnResponse[Return cached response]
    
    IsCached -->|No| CheckCacheConfig{config.cache<br/>exists?}
    CheckCacheConfig -->|No| Debug3[Debug: 'Response with config.cache falsy']
    Debug3 --> ReturnResponse
    
    CheckCacheConfig -->|Yes| CheckUpdate{cache.update<br/>configured?}
    CheckUpdate -->|Yes| UpdateOther[Update other cache entries<br/>per update configuration]
    CheckUpdate -->|No| CheckMethod
    UpdateOther --> CheckMethod
    
    CheckMethod{Method in<br/>cache.methods?}
    CheckMethod -->|No| Debug4[Debug: 'Ignored because method not in cache.methods']
    Debug4 --> ReturnResponse
    
    CheckMethod -->|Yes| GetStorage[Get cache from storage]
    GetStorage --> CheckStorageState{Storage state<br/>=== 'loading'?}
    
    CheckStorageState -->|No| Debug5[Debug: "Response not cached and storage isn't loading"]
    Debug5 --> ReturnResponse
    
    CheckStorageState -->|Yes| CheckPredicate{Has previous data<br/>OR cache predicate<br/>passes?}
    
    CheckPredicate -->|No| RejectCache[Reject cache: Remove from storage<br/>Reject waiting deferred]
    RejectCache --> Debug6[Debug: 'Cache predicate rejected this response']
    Debug6 --> ReturnResponse
    
    CheckPredicate -->|Yes| CleanHeaders[Remove remnant x-axios-cache* headers]
    
    CleanHeaders --> CheckEtag{config.etag<br/>configured?}
    CheckEtag -->|Yes & not true| SetEtagHeader[Set X-Axios-Cache-Etag header]
    CheckEtag -->|No or true| CheckModifiedSince
    SetEtagHeader --> CheckModifiedSince
    
    CheckModifiedSince{config.modifiedSince<br/>configured?}
    CheckModifiedSince -->|Yes| SetModifiedHeader[Set X-Axios-Cache-Last-Modified header]
    CheckModifiedSince -->|No| InitTTL
    SetModifiedHeader --> InitTTL
    
    InitTTL[Initialize TTL from config.ttl] --> InterpretHeader{config.interpretHeader<br/>=== true?}
    
    InterpretHeader -->|No| CreateResponse
    InterpretHeader -->|Yes| ParseHeaders[Parse response headers via headerInterpreter]
    
    ParseHeaders --> InterpretResult{Header<br/>interpretation result?}
    
    InterpretResult -->|'dont cache'| RejectDontCache[Reject cache: Remove from storage<br/>Reject waiting deferred]
    RejectDontCache --> Debug7[Debug: "Cache header interpreted as 'dont cache'"]
    Debug7 --> ReturnResponse
    
    InterpretResult -->|'not enough headers'| CreateResponse
    InterpretResult -->|number| SetNumericTTL[Set TTL to interpreted value]
    InterpretResult -->|object| SetTTLs[Set TTL and staleTtl from object]
    
    SetNumericTTL --> CreateResponse
    SetTTLs --> CreateResponse
    
    CreateResponse[Create cached response object] --> CheckFunctionTTL{TTL is a function?}
    CheckFunctionTTL -->|Yes| EvaluateTTL[Call TTL function with response]
    CheckFunctionTTL -->|No| CheckStaleIfError
    EvaluateTTL --> CheckStaleIfError
    
    CheckStaleIfError{config.staleIfError<br/>configured?}
    CheckStaleIfError -->|Yes| SetStaleHeader[Set X-Axios-Cache-Stale-If-Error header]
    CheckStaleIfError -->|No| Debug8
    SetStaleHeader --> Debug8
    
    Debug8[Debug: 'Useful response configuration found'] --> CreateCacheValue[Create CachedStorageValue:<br/>state: 'cached'<br/>ttl, staleTtl, createdAt, data]
    
    CreateCacheValue --> SaveStorage[Save to storage]
    SaveStorage --> CheckWaiting{Deferred exists<br/>in waiting map?}
    
    CheckWaiting -->|Yes| ResolveDeferred[Resolve deferred promise<br/>Delete from waiting map]
    CheckWaiting -->|No| Debug10
    ResolveDeferred --> Debug9[Debug: 'Found waiting deferred(s) and resolved them']
    
    Debug9 --> Debug10[Debug: 'Response cached']
    Debug10 --> ReturnResponse
    
    ReturnResponse --> End([Return response to client])
    ThrowError1 --> EndError([Error thrown])
    
    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style EndError fill:#ffe1e1
    style ReturnResponse fill:#e1f0ff
    style Debug1 fill:#fff4e1
    style Debug2 fill:#fff4e1
    style Debug3 fill:#fff4e1
    style Debug4 fill:#fff4e1
    style Debug5 fill:#fff4e1
    style Debug6 fill:#fff4e1
    style Debug7 fill:#fff4e1
    style Debug8 fill:#fff4e1
    style Debug9 fill:#fff4e1
    style Debug10 fill:#fff4e1
    style RejectCache fill:#ffe1e1
    style RejectDontCache fill:#ffe1e1
```

## Key Points

### Cache Predicate
Determines if a response should be cached based on:
- Status code (default: 200, 203, 300, 301, 302, 404, 405, 410, 414, 501)
- Response matching custom predicate
- Required headers present

### Header Interpretation
When `interpretHeader` is enabled, the interceptor reads:
- `Cache-Control`: max-age, immutable, no-cache, no-store, etc.
- `Expires`: HTTP/1.0 fallback
- `Age`: For calculating remaining TTL

### TTL Calculation
1. If `interpretHeader` is true, parse response headers
2. If headers say "dont cache", reject
3. If headers provide TTL, use it
4. Otherwise, fall back to `config.ttl`
5. If TTL is a function, call it with the response

### Deferred Resolution
When caching succeeds, all waiting concurrent requests are notified:
- Deferred promise is resolved
- Waiting requests can now access the cached data
- No duplicate network requests needed

## Related

- [Request Interceptor](/diagrams/request-interceptor) - How requests enter the system
- [Error Handler](/diagrams/response-error-interceptor) - What happens on errors
- [Header Interpreter](/diagrams/header-interpreter) - How headers are parsed
