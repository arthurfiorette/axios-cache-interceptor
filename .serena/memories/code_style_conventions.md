# Code Style and Conventions

## Language and Configuration

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Module System**: ESNext with NodeNext module resolution
- **Target**: ESNext for modern JavaScript features

## Code Quality Tools

- **Biome**: Used for linting, formatting, and code quality
  - Configuration extends `@arthurfiorette/biomejs-config`
  - Excludes build directories, dist, dev, coverage, node_modules
- **TypeScript**: Strict configuration with all strict flags enabled

## TypeScript Configuration Highlights

- `strict: true` - All strict type checking enabled
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noUncheckedIndexedAccess: true`
- `verbatimModuleSyntax: true`

## File Structure Conventions

- Use `.ts` extensions for TypeScript files
- Use `.js` extensions in import statements (for ESM compatibility)
- Mirror test file structure with source files
- Use kebab-case for file names when multiple words

## Import/Export Conventions

- Use named exports primarily
- Main `index.ts` re-exports all public APIs
- Use `.js` extensions in imports (transpiled to correct format)

## Development Build Support

- Uses `__ACI_DEV__` global constant for development-specific code
- Development builds include console warnings
- Production builds strip development code

## Code Organization

- Modular architecture with clear separation of concerns
- Each module has its own directory with related types
- Utilities are separated into dedicated util modules
- Types defined close to implementation
- Interfaces over classes (functional programming style)

## Testing Patterns

### Test Framework

- Node.js built-in `node:test` (no external framework)
- Assertions via `node:assert`
- Tests colocated in `test/` directory mirroring `src/`

### Common Test Patterns

```typescript
// Concurrent request testing
const [resp1, resp2] = await Promise.all([
  axios.get('url'),
  axios.get('url')
]);
assert.equal(resp1.cached, false);
assert.ok(resp2.cached);

// Storage state testing
const cache = await axios.storage.get(response.id);
assert.equal(cache.state, 'cached');

// Cache invalidation
await axios.storage.remove(cacheKey);
```

### Test Coverage

- Aim for high coverage (currently >99%)
- All edge cases must have tests
- Concurrent scenarios are critical
- Vary header edge cases well-tested

## Anti-Patterns to Avoid

### 1. Mutating Cached Data

```typescript
// BAD - mutates cache
const res = await axios.get('/api/user');
res.data.name = 'Modified'; // This affects cached data!

// GOOD - use cloning storage
setupCache(axios, {
  storage: buildMemoryStorage(true) // cloneData = true
});
```

### 2. Weak Hashing for Large-Scale Storage

```typescript
// BAD - default 32-bit hash has collision risk at ~77k keys
setupCache(axios, { storage: redisStorage });

// GOOD - use cryptographic hash for persistent storage
setupCache(axios, {
  storage: redisStorage,
  generateKey: buildKeyGenerator((req) => {
    return createHash('sha256')
      .update(JSON.stringify([req.url, req.method, req.params]))
      .digest('hex');
  })
});
```

### 3. Disabling Vary Without Understanding

```typescript
// BAD - cache poisoning risk
setupCache(axios, { vary: false });
// User A sees User B's data!

// GOOD - keep vary enabled (default)
setupCache(axios, { vary: true });
```

### 4. Ignoring interpretHeader

```typescript
// BAD - ignores server cache directives
setupCache(axios, { interpretHeader: false });
// Server sends Cache-Control: no-store but still cached!

// GOOD - disable per-request when needed
axios.get('/api/data', {
  cache: { interpretHeader: false, ttl: 60000 }
});
```

## Debug Patterns

### Development Build Usage

```typescript
// Import from /dev for debug logging
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(instance, {
  debug: console.log // or custom logger
});
```

### Debug Output Format

```typescript
{
  id: 'request-id',
  msg: 'Human-readable message',
  data: { /* contextual data */ }
}
```

## Performance Considerations

### Memory Management

- Default `maxEntries: 1024` may need tuning
- Use `cleanupInterval` to prevent memory leaks
- `maxStaleAge` prevents stale entry accumulation
- Consider persistent storage for large datasets

### Computational Efficiency

- Key generation: O(1) with object-code hash
- Cache lookup: O(1) with Map storage
- Vary comparison: O(n) where n = number of vary headers
- Header interpretation: O(1) string parsing

### Network Efficiency

- Request deduplication eliminates redundant calls
- Stale-while-revalidate minimizes perceived latency
- ETag/Last-Modified saves bandwidth (304 responses)
- cacheTakeover prevents double caching

## Important Edge Cases

### Vary: \* Behavior

`Vary: *` means uncacheable in shared caches, so library marks as immediately stale.

### Concurrent Vary Mismatches

When concurrent requests have different vary headers, each gets its own cache after mismatch detection.

### Storage Eviction During Loading

If cache entry evicted while request in-flight, interceptor handles gracefully (no-op cleanup).

### Request Cancellation

Cancelled requests must reject deferred to unblock concurrent requests, but preserve cache if already cached.

### 304 Not Modified

Keep existing cached data, update timestamps to extend TTL.

## Code Review Checklist

When reviewing code:

1. ✅ Does it handle concurrent requests correctly?
2. ✅ Are storage state transitions correct?
3. ✅ Does it respect HTTP caching standards?
4. ✅ Are all waiting promises resolved/rejected?
5. ✅ Does it avoid cache poisoning (Vary support)?
6. ✅ Are edge cases tested?
7. ✅ Is debug logging added for development build?
8. ✅ Does it follow TypeScript strict mode?
