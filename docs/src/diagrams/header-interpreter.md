# Header Interpreter Flow

This diagram shows how HTTP response headers are interpreted to calculate cache TTL.

```mermaid
flowchart TB
    Start([Header Interpreter Entry]) --> CheckHeaders{Headers exist?}
    
    CheckHeaders -->|No| ReturnNotEnough["Return 'not enough headers'"]
    CheckHeaders -->|Yes| GetCacheControl[Extract Cache-Control header]
    
    GetCacheControl --> HasCacheControl{Cache-Control<br/>header exists?}
    
    HasCacheControl -->|Yes| ParseCC[Parse Cache-Control using cache-parser]
    ParseCC --> CheckNoCache{Has no-cache<br/>OR no-store?}
    
    CheckNoCache -->|Yes| ReturnDontCache["Return 'dont cache'"]
    CheckNoCache -->|No| CheckPrivate{Has private<br/>AND location is server?}
    
    CheckPrivate -->|Yes| ReturnDontCache
    CheckPrivate -->|No| CheckImmutable{Has immutable<br/>directive?}
    
    CheckImmutable -->|Yes| ReturnYear["Return cache: 1 year<br/>(31,536,000,000 ms)<br/>Immutable = very long cache"]
    CheckImmutable -->|No| CheckMaxAge{Has max-age<br/>directive?}
    
    CheckMaxAge -->|Yes| CheckAge{Has Age<br/>header?}
    CheckAge -->|Yes| CalcWithAge["Calculate: (max-age - age) * 1000<br/>Subtract age from max-age"]
    CheckAge -->|No| CalcNoAge["Calculate: max-age * 1000<br/>Full max-age time"]
    
    CalcWithAge --> CheckStale
    CalcNoAge --> CheckStale
    
    CheckStale{Has max-stale OR<br/>stale-while-revalidate?}
    CheckStale -->|max-stale| ReturnWithMaxStale["Return:<br/>cache: calculated TTL<br/>stale: max-stale * 1000"]
    CheckStale -->|stale-while-revalidate| ReturnWithSWR["Return:<br/>cache: calculated TTL<br/>stale: stale-while-revalidate * 1000"]
    CheckStale -->|No| ReturnJustCache["Return:<br/>cache: calculated TTL<br/>stale: undefined"]
    
    CheckMaxAge -->|No| CheckExpires
    HasCacheControl -->|No| CheckExpires
    
    CheckExpires{Has Expires<br/>header?}
    CheckExpires -->|Yes| ParseExpires[Parse Expires date]
    ParseExpires --> CalcExpires["Calculate: Date.parse(expires) - Date.now()"]
    CalcExpires --> CheckPositive{Milliseconds >= 0?}
    
    CheckPositive -->|Yes| ReturnExpires["Return:<br/>cache: calculated milliseconds"]
    CheckPositive -->|No| ReturnDontCache
    
    CheckExpires -->|No| ReturnNotEnough
    
    ReturnNotEnough --> End([Return to caller])
    ReturnDontCache --> End
    ReturnYear --> End
    ReturnWithMaxStale --> End
    ReturnWithSWR --> End
    ReturnJustCache --> End
    ReturnExpires --> End
    
    Note1[<b>Cache-Control Directives Priority:</b><br/>1. no-cache/no-store/private → dont cache<br/>2. immutable → 1 year<br/>3. max-age + max-stale → cache + stale<br/>4. max-age + stale-while-revalidate → cache + stale<br/>5. max-age only → cache only]
    
    Note2[<b>Age Header:</b><br/>Indicates response age in seconds<br/>Subtracted from max-age to get remaining time<br/>Common in CDN/proxy responses]
    
    Note3[<b>Stale Directives:</b><br/>max-stale: Preferred for background revalidation<br/>stale-while-revalidate: Alternative stale extension<br/>Both extend usability beyond TTL]
    
    Note4[<b>Expires Header:</b><br/>Fallback if no Cache-Control<br/>HTTP/1.0 compatibility<br/>Less precise than max-age]
    
    Note5[<b>Return Values:</b><br/>'dont cache' → Reject caching<br/>'not enough headers' → Use config.ttl<br/>Number/Object → Use calculated TTL]
    
    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style ReturnDontCache fill:#ffe1e1
    style ReturnNotEnough fill:#fff4e1
    style ReturnYear fill:#d1ffe1
    style ReturnWithMaxStale fill:#d1ffe1
    style ReturnWithSWR fill:#d1ffe1
    style ReturnJustCache fill:#d1ffe1
    style ReturnExpires fill:#d1ffe1
    style Note1 fill:#e1f0ff,stroke:#333,stroke-width:2px
    style Note2 fill:#e1f0ff,stroke:#333,stroke-width:2px
    style Note3 fill:#e1f0ff,stroke:#333,stroke-width:2px
    style Note4 fill:#e1f0ff,stroke:#333,stroke-width:2px
    style Note5 fill:#e1f0ff,stroke:#333,stroke-width:2px
```

## Cache-Control Directives

### Directive Priority

1. **no-cache / no-store / private** → Don't cache
2. **immutable** → Cache for 1 year (very long TTL)
3. **max-age** → Primary TTL directive
4. **stale-while-revalidate / max-stale** → Extended stale TTL

### Age Header

The `Age` header indicates how old a response is (in seconds):
- Common in CDN/proxy responses
- Subtracted from `max-age` to get remaining cache time
- Example: `max-age=3600, Age=1000` → cache for 2600 more seconds

### Stale Directives

**max-stale** (preferred):
- Indicates how long stale data can be used
- Used for background revalidation scenarios

**stale-while-revalidate** (alternative):
- Alternative stale extension mechanism
- If both present, max-stale is preferred

## Expires Header

HTTP/1.0 compatibility:
- Used as fallback if no `Cache-Control`
- Contains absolute date/time
- Less precise than `max-age`
- Calculated as: `Date.parse(expires) - Date.now()`

## Return Values

### "dont cache"
Response should not be cached:
- `no-cache` or `no-store` present
- `private` on server-side
- `Expires` date in the past

### "not enough headers"
No caching headers found:
- Falls back to `config.ttl`
- Default behavior when server doesn't specify

### Number
Single TTL value in milliseconds:
- From `Expires` header
- Or from `max-age` without stale directives

### Object {cache, stale}
TTL with stale extension:
- `cache`: Primary TTL in milliseconds
- `stale`: Additional time stale data is acceptable

## Examples

### Immutable Resource
```
Cache-Control: immutable
→ cache for 1 year
```

### Standard TTL
```
Cache-Control: max-age=3600
→ cache for 1 hour
```

### With Age
```
Cache-Control: max-age=3600
Age: 1800
→ cache for 30 minutes (remaining)
```

### With Stale Extension
```
Cache-Control: max-age=3600, stale-while-revalidate=86400
→ cache: 1 hour, stale: 24 hours
```

### Don't Cache
```
Cache-Control: no-store
→ dont cache
```

## Related

- [Response Interceptor](/diagrams/response-interceptor) - How TTL is used
- [Cache States](/diagrams/cache-states) - What happens when TTL expires
