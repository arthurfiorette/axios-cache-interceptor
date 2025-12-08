# Request/Response Flow Overview

This diagram shows the high-level overview of how a request flows through the axios-cache-interceptor system.

```mermaid
flowchart TB
    Start([Client makes HTTP request]) --> Setup{setupCache called?}
    
    Setup -->|No| DirectAxios[Direct Axios Request]
    Setup -->|Yes| ReqInterceptor[Request Interceptor]
    
    ReqInterceptor --> CheckCache{Check Cache State}
    
    CheckCache -->|cached & fresh| CachedAdapter[Custom Cached Adapter]
    CheckCache -->|empty/stale/must-revalidate| MarkLoading[Mark as 'loading' in storage]
    CheckCache -->|loading by another request| WaitForOther[Wait for other request]
    
    WaitForOther --> OtherResolved{Other request resolved?}
    OtherResolved -->|Success| CachedAdapter
    OtherResolved -->|Failed| MarkLoading
    
    MarkLoading --> RealAdapter[Real Axios Adapter<br/>HTTP request to server]
    
    CachedAdapter --> ResInterceptor[Response Interceptor<br/>onFulfilled]
    RealAdapter --> ServerResponse{Server Response}
    
    ServerResponse -->|Success| ResInterceptor
    ServerResponse -->|Error| ResErrorInterceptor[Response Interceptor<br/>onRejected]
    
    ResInterceptor --> IsCached{Response from cache?}
    IsCached -->|Yes| ReturnCached[Return cached response]
    IsCached -->|No| ProcessResponse[Process server response]
    
    ProcessResponse --> TestPredicate{Cache predicate<br/>passes?}
    TestPredicate -->|No| RejectCache[Reject cache entry]
    TestPredicate -->|Yes| InterpretHeaders{interpretHeader<br/>enabled?}
    
    InterpretHeaders -->|Yes| ParseHeaders[Parse Cache-Control,<br/>Expires headers]
    InterpretHeaders -->|No| UseConfigTTL[Use config.ttl]
    
    ParseHeaders --> CheckCacheability{Should cache?}
    CheckCacheability -->|dont cache| RejectCache
    CheckCacheability -->|Yes| CalculateTTL[Calculate TTL & staleTtl]
    
    UseConfigTTL --> CalculateTTL
    
    CalculateTTL --> SaveCache[Save to storage as 'cached']
    SaveCache --> ResolveWaiting[Resolve waiting requests]
    ResolveWaiting --> ReturnResponse[Return server response]
    
    RejectCache --> RejectWaiting[Reject waiting requests]
    RejectWaiting --> ReturnResponse
    
    ResErrorInterceptor --> CheckStaleIfError{staleIfError enabled<br/>& stale data exists?}
    CheckStaleIfError -->|Yes| ReturnStale[Return stale data]
    CheckStaleIfError -->|No| RejectError[Reject & throw error]
    
    ReturnStale --> EndSuccess
    ReturnCached --> EndSuccess
    ReturnResponse --> EndSuccess([Response returned to client])
    RejectError --> EndError([Error thrown to client])
    DirectAxios --> EndSuccess
    
    style Start fill:#e1f5e1
    style EndSuccess fill:#e1f5e1
    style EndError fill:#ffe1e1
    style CachedAdapter fill:#fff4e1
    style ReqInterceptor fill:#e1f0ff
    style ResInterceptor fill:#e1f0ff
    style ResErrorInterceptor fill:#ffe1f0
```

## Key Points

- **Green nodes**: Entry and exit points
- **Blue nodes**: Interceptor processing
- **Yellow nodes**: Cached adapter (no network request)
- **Red nodes**: Error paths

## Flow Explanation

1. **Request Entry**: When a request is made, it first checks if setupCache was called
2. **Request Interceptor**: Evaluates cache state and decides whether to use cache or make a network request
3. **Adapter**: Either uses cached data directly or makes an actual HTTP request
4. **Response Interceptor**: Processes the response and decides whether to cache it
5. **Error Handler**: Handles failures and can return stale data if configured

For more detailed flows, see:
- [Request Interceptor Details](/diagrams/request-interceptor)
- [Response Interceptor Details](/diagrams/response-interceptor)
- [Error Handler Details](/diagrams/response-error-interceptor)
