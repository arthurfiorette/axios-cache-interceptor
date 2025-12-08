# Response Error Handler Flow

This diagram shows the detailed flow through the response interceptor when errors occur.

```mermaid
flowchart TB
    Start([Response Interceptor Entry<br/>onRejected - Error Handler]) --> CheckAxiosError{Is Axios error<br/>& config exists?}
    
    CheckAxiosError -->|No| Debug1[Debug: 'FATAL: Received non-axios error in rejected interceptor']
    Debug1 --> ThrowError[Re-throw error]
    
    CheckAxiosError -->|Yes| ExtractData[Extract config, id, cache config, response]
    ExtractData --> CheckCacheConfig{config.cache<br/>& id exist?}
    
    CheckCacheConfig -->|No| Debug2[Debug: 'Web request returned error but cache handling not enabled']
    Debug2 --> ThrowError
    
    CheckCacheConfig -->|Yes| CheckMethod{Method in<br/>cache.methods?}
    CheckMethod -->|No| Debug3[Debug: 'Ignored because method not in cache.methods']
    Debug3 --> RejectWaiting1[Reject waiting requests<br/>Remove from storage]
    RejectWaiting1 --> ThrowError
    
    CheckMethod -->|Yes| GetStorage[Get cache from storage]
    GetStorage --> CheckStorageState{State === 'loading'<br/>AND previous === 'stale'?}
    
    CheckStorageState -->|No| Debug4[Debug: 'Caught an error in the request interceptor']
    Debug4 --> CheckCancelled{Error code is<br/>ERR_CANCELED?}
    
    CheckCancelled -->|Yes & state is cached| KeepCache[Do not clear cache]
    CheckCancelled -->|No or state not cached| RejectWaiting2[Reject waiting requests<br/>Remove from storage]
    KeepCache --> ThrowError
    RejectWaiting2 --> ThrowError
    
    CheckStorageState -->|Yes| CheckStaleIfError{config.staleIfError<br/>configured?}
    CheckStaleIfError -->|No| Debug7
    
    CheckStaleIfError -->|Yes| Debug5[Debug: 'Found cache if stale config for rejected response']
    Debug5 --> EvaluateStaleIfError{Evaluate<br/>staleIfError value}
    
    EvaluateStaleIfError -->|Function| CallFunction[Call staleIfError function<br/>with response, cache, error]
    EvaluateStaleIfError -->|true & has stale-if-error header| ParseHeader[Parse stale-if-error from<br/>Cache-Control header]
    EvaluateStaleIfError -->|Number| UseNumber[Use staleIfError value]
    EvaluateStaleIfError -->|true & no header| UseBoolean[Use true value]
    
    CallFunction --> CheckResult
    ParseHeader --> CheckResult
    UseNumber --> CheckResult
    UseBoolean --> CheckResult
    
    CheckResult{staleIfError === true<br/>OR within time window?}
    CheckResult -->|No| Debug7[Debug: 'Received unknown error that could not be handled']
    
    CheckResult -->|Yes| RemarkStale[Re-mark cache as 'stale' in storage<br/>Update createdAt to now]
    RemarkStale --> CheckWaiting{Deferred exists<br/>in waiting map?}
    
    CheckWaiting -->|Yes| ResolveDeferred[Resolve deferred promise<br/>Delete from waiting map]
    CheckWaiting -->|No| Debug8
    ResolveDeferred --> Debug6[Debug: 'Found waiting deferred(s) and resolved them']
    
    Debug6 --> Debug8[Debug: 'staleIfError resolved this response with cached data']
    Debug8 --> ReturnStale[Return stale cached response:<br/>cached: true<br/>stale: true]
    
    Debug7 --> RejectWaiting3[Reject waiting requests<br/>Remove from storage]
    RejectWaiting3 --> ThrowError
    
    ReturnStale --> End([Return stale response to client])
    ThrowError --> EndError([Error thrown to client])
    
    style Start fill:#ffe1e1
    style End fill:#e1f5e1
    style EndError fill:#ffe1e1
    style ReturnStale fill:#ffe8d1
    style Debug1 fill:#fff4e1
    style Debug2 fill:#fff4e1
    style Debug3 fill:#fff4e1
    style Debug4 fill:#fff4e1
    style Debug5 fill:#fff4e1
    style Debug6 fill:#fff4e1
    style Debug7 fill:#fff4e1
    style Debug8 fill:#fff4e1
    style RejectWaiting1 fill:#ffe1e1
    style RejectWaiting2 fill:#ffe1e1
    style RejectWaiting3 fill:#ffe1e1
    style ThrowError fill:#ffe1e1
```

## Key Points

### staleIfError
Allows returning stale cached data instead of throwing an error:
- Can be `true`, a number (milliseconds), or a function
- Checks if stale data exists and is still within acceptable time window
- Server `Cache-Control: stale-if-error` directive can also control this

### Error Types

#### Non-Axios Errors
- Not an Axios error or missing config
- Cannot be handled, error is re-thrown
- May leave storage in loading state

#### Axios Errors Without Cache
- Error occurred but caching not enabled
- Error is re-thrown normally

#### Cached Errors (Recoverable)
- Error occurred during revalidation of stale data
- If `staleIfError` allows, return the stale data
- Otherwise, reject cache and throw error

### Cancelled Requests
Special handling for `ERR_CANCELED`:
- If state is already `cached`, keep the cache
- Otherwise, clean up the loading state

### Deferred Handling

#### On Success (staleIfError returns data)
- Deferred is resolved
- Waiting requests get the stale data
- Cache state is marked as `stale`

#### On Failure
- Deferred is rejected
- Waiting requests are notified of failure
- Cache is cleaned up
- Error is thrown

## Related

- [Response Interceptor](/diagrams/response-interceptor) - Success path handling
- [Request Interceptor](/diagrams/request-interceptor) - How requests start
- [Cache States](/diagrams/cache-states) - State transitions
