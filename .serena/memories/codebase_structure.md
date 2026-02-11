# Codebase Structure

## Root Directory

- `src/` - Main source code
- `test/` - Test files (mirrors src structure)
- `docs/` - VitePress documentation
- `examples/` - Usage examples
- `benchmark/` - Performance benchmarks
- `build.sh` - Custom build script
- `package.json` - Project configuration
- `biome.json` - Code quality configuration
- `tsconfig.json` - TypeScript configuration

## Source Code Structure (`src/`)

### Core Modules

- `index.ts` - Main entry point (exports all modules, includes `__ACI_DEV__` warning)

### `cache/` - Core Types and Setup

- **`axios.ts`** - Extended Axios types
  - `AxiosCacheInstance` - Enhanced axios instance with cache methods
  - `CacheAxiosResponse` - Response with `cached`, `stale`, `id` properties
  - `CacheRequestConfig` - Request config with `cache` options
- **`cache.ts`** - Cache configuration interfaces
  - `CacheProperties` - Per-request cache options (ttl, methods, etag, vary, etc.)
  - `CacheInstance` - Global cache instance properties (storage, generateKey, debug, etc.)
- **`create.ts`** - `setupCache()` function (main entry point)
  - Validates single initialization
  - Merges global and default config
  - Applies request/response interceptors

### `interceptors/` - Request/Response Pipeline

- **`request.ts`** - Request interceptor (MOST COMPLEX)
  - Generates request ID (cache key)
  - Checks cache state (empty/cached/stale/loading)
  - Handles concurrent request deduplication (waiting Map)
  - Detects Vary header mismatches and switches keys
  - Adds conditional headers (If-None-Match, If-Modified-Since)
  - Calls hydrate callback for stale cache
  - Injects custom adapter for cached responses
- **`response.ts`** - Response interceptor
  - Tests cache predicate (should this be cached?)
  - Interprets headers for TTL (Cache-Control, Expires)
  - Stores cache metadata (ETag, Last-Modified, Vary)
  - Handles `Vary: *` (mark as stale immediately)
  - Implements stale-if-error logic
  - Resolves/rejects waiting concurrent requests
- **`util.ts`** - Shared interceptor utilities
  - `createValidateStatus()` - Custom status validator
  - `isMethodIn()` - Check if method is cacheable
  - `updateStaleRequest()` - Add conditional headers
  - `createCacheResponse()` - Build cached response object
- **`build.ts`** - Interceptor type definitions

### `storage/` - Storage Adapters

- **`types.ts`** - Storage contract (CRITICAL)
  - `StorageValue` - Union of all states (empty/cached/stale/loading/must-revalidate)
  - `CachedResponse` - Stored response structure (data, headers, status, meta)
  - `CachedResponseMeta` - Metadata (vary headers, revalidation info)
  - `AxiosStorage` - Interface (get/set/remove/clear methods)
- **`build.ts`** - `buildStorage()` function
  - Abstracts storage interface
  - Handles TTL expiration logic
  - Manages stale state transitions
- **`memory.ts`** - In-memory storage (DEFAULT)
  - JavaScript Map for O(1) lookups
  - Optional data cloning (prevent mutations)
  - Automatic cleanup interval
  - FIFO eviction with `maxEntries`
  - `maxStaleAge` to prevent memory leaks
- **`web-api.ts`** - localStorage/sessionStorage adapter
  - JSON serialization
  - Key prefixing
  - Quota exceeded handling (auto-eviction)

### `header/` - HTTP Header Interpretation

- **`headers.ts`** - Header name constants (Header.CacheControl, etc.)
- **`interpreter.ts`** - `defaultHeaderInterpreter()`
  - Parses Cache-Control (max-age, no-cache, no-store, etc.)
  - Handles Expires header
  - Returns 'dont cache' | 'not enough headers' | number | {cache, stale}
- **`extract.ts`** - `extractHeaders()`
  - Extracts subset of headers by name
  - Used for Vary header support
  - Returns Record<string, string | undefined>
- **`types.ts`** - Header type definitions

### `util/` - General Utilities

- **`key-generator.ts`** - Cache key generation
  - `defaultKeyGenerator` - Hashes method, url, params, data
  - `buildKeyGenerator()` - Factory for custom generators
  - Removes trailing slashes for consistency
  - Normalizes method to lowercase
- **`cache-predicate.ts`** - Cacheability testing
  - `testCachePredicate()` - Should response be cached?
  - Tests status codes, headers, response body
  - Supports `ignoreUrls` and `allowUrls` filters
- **`update-cache.ts`** - Cross-cache updates
  - `updateCache()` - Update other cache entries after request
  - Supports 'delete' | 'ignore' | function updater
- **`types.ts`** - Shared type definitions
  - `CachePredicate`, `CacheUpdater`, `KeyGenerator`, etc.

## Test Structure (`test/`)

- Mirrors the `src/` directory structure
- Uses Node.js built-in test runner (`node:test`)
- Assertions via `node:assert`
- Includes mock utilities in `test/mocks/`
  - `mockAxios()` - Pre-configured axios instance with cache
  - Mock adapters that return successful responses
- Setup file: `test/setup.js`
- Key test patterns:
  - Concurrent request testing with `Promise.all()`
  - Storage state validation
  - Cache invalidation scenarios
  - Vary header edge cases
  - Error handling (stale-if-error)

## Documentation Structure (`docs/`)

- **VitePress-based** documentation site
- `docs/src/` - Markdown source files
  - `guide/` - User guides (getting-started, debugging, storages, etc.)
  - `config/` - Configuration reference
  - `others/` - License, changelog
  - `generated/` - Auto-generated content (benchmarks)
- `docs/.vitepress/` - VitePress configuration
- Built to static HTML with `pnpm docs:build`

## Build Outputs

### Production Build (`dist/`)

- `index.cjs` - CommonJS
- `index.mjs` - ES Module
- `index.bundle.js` - UMD for browsers (minified)
- `index.d.cts` / `index.d.mts` - TypeScript declarations
- `__ACI_DEV__ = false` (debug code stripped)

### Development Build (`dev/`)

- `index.cjs` / `index.mjs` - Same formats but with debug logging
- `__ACI_DEV__ = true` (includes `axios.debug()` calls)
- Larger bundle, comprehensive logging
- Import from `'axios-cache-interceptor/dev'`

## File Naming Conventions

- Use `.ts` for TypeScript source files
- Import with `.js` extension (ESM compatibility): `import { foo } from './bar.js'`
- Test files: `*.test.ts` (same name as source file)
- Use kebab-case for multi-word filenames
