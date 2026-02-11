# Axios Cache Interceptor - Project Overview

## Purpose

Axios Cache Interceptor is a high-performance HTTP caching layer for Axios that intercepts requests and responses to provide intelligent caching with minimal configuration. It prevents redundant network requests, handles concurrent requests efficiently, and supports HTTP caching standards.

## Core Capabilities

### Request Deduplication

- Concurrent identical requests share a single network call
- Uses `Deferred` promises in a `waiting` Map to coordinate requests
- Critical for performance in high-concurrency scenarios

### HTTP Standards Compliance

- **Cache-Control**: Respects max-age, s-maxage, no-cache, no-store, must-revalidate
- **ETag & If-None-Match**: 304 Not Modified revalidation
- **Last-Modified & If-Modified-Since**: Timestamp-based revalidation
- **Vary**: Content negotiation with header-aware cache keys
- **stale-if-error**: Serve stale cache on network errors
- **stale-while-revalidate**: Background cache refresh

### Storage Flexibility

- Built-in: Memory (with FIFO eviction), localStorage, sessionStorage
- Extensible: Easy to build Redis, IndexedDB, or custom storage adapters
- All storage uses a unified state machine (empty/cached/stale/loading/must-revalidate)

## Key Features

- ⚡ Automatic request deduplication
- 📦 Multiple build targets (ESM, CJS, UMD, Development)
- 🔩 Zero-config setup with extensive per-request customization
- 🛠️ RFC-compliant HTTP caching (7231, 7232, 7234)
- 🌐 Works in Node.js and browsers
- 🔑 TypeScript-first with comprehensive types
- 🐛 Development builds with detailed debug logging

## Tech Stack

- **Language**: TypeScript 5.9+ (strict mode)
- **Package Manager**: pnpm (configured in packageManager field)
- **Node Version**: >=12 (engines in package.json)
- **Build Tool**: tsdown (produces multiple formats + dev builds)
- **Code Quality**: Biome (linting, formatting)
- **Testing**: Node.js built-in test runner (node:test) with c8 coverage
- **Documentation**: VitePress with custom plugins

## Basic Usage

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const instance = Axios.create();
const axios = setupCache(instance);

const req1 = axios.get('https://arthur.place/');
const req2 = axios.get('https://arthur.place/');

const [res1, res2] = await Promise.all([req1, req2]);

res1.cached; // false - first request made network call
res2.cached; // true - deduplication, shared network call
```

## Core Architecture

### Request Lifecycle

1. Request interceptor generates cache key (Request ID)
2. Checks storage for cached data
3. If cached: Returns immediately
4. If loading (concurrent): Waits on shared deferred promise
5. If empty/stale: Makes network request
6. Response interceptor stores in cache
7. Resolves all waiting concurrent requests

### Storage State Machine

Every cache entry has one state:

- **empty**: No data exists
- **cached**: Valid data within TTL
- **stale**: Expired but revalidatable (ETag/Last-Modified)
- **must-revalidate**: Cache-Control: must-revalidate (stricter than stale)
- **loading**: Request in-flight (tracks previous state: empty/stale/must-revalidate)

### Cache Key Generation

- Uses `config.id` if provided (manual override)
- Otherwise: Hashes `method`, `baseURL`, `url`, `params`, `data`
- Vary support: Includes subset of request headers in key
- Uses `object-code` for 32-bit hash (fast but collision risk at ~77k keys)

## Important Concepts

### Vary Header Support

Server sends `Vary: Authorization` → Different auth headers = different cache entries. Prevents cache poisoning from content negotiation.

### Hydrate Pattern

Optimistic UI updates: When making network request but stale cache exists, calls `cache.hydrate(staleData)` immediately so UI can update before network completes.

### Cache Takeover

Prevents double-caching by browser and library. Adds headers to request: `Cache-Control: no-cache, no-store, must-revalidate, max-age=0`

## Dependencies

### Runtime

- **axios**: HTTP client (peer dependency)
- **cache-parser**: Parse Cache-Control headers
- **fast-defer**: Efficient deferred promises for request coordination
- **http-vary**: RFC-compliant Vary header parsing
- **object-code**: Fast 32-bit hashing for cache keys
- **try**: Safe function execution

### Development

- **tsdown**: TypeScript bundler
- **c8**: Code coverage
- **biome**: Linting and formatting
- **vitepress**: Documentation site
