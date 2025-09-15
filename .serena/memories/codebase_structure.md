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

- `index.ts` - Main entry point (exports all modules)
- `cache/` - Core caching functionality
  - `axios.ts` - Axios integration
  - `cache.ts` - Cache implementation
  - `create.ts` - Cache creation utilities
- `interceptors/` - Request/response interceptors
  - `request.ts` - Request interceptor logic
  - `response.ts` - Response interceptor logic
  - `build.ts` - Interceptor building utilities
  - `util.ts` - Interceptor utilities
- `storage/` - Storage adapters
  - `memory.ts` - In-memory storage
  - `web-api.ts` - Web API storage (localStorage, etc.)
  - `build.ts` - Storage building utilities
  - `types.ts` - Storage type definitions
- `header/` - HTTP header handling
  - `headers.ts` - Header utilities
  - `interpreter.ts` - Cache header interpretation
  - `types.ts` - Header type definitions
- `util/` - General utilities
  - `cache-predicate.ts` - Cache condition checking
  - `key-generator.ts` - Cache key generation
  - `update-cache.ts` - Cache updating logic
  - `types.ts` - Utility type definitions

## Test Structure (`test/`)

- Mirrors the `src/` directory structure
- Uses Node.js built-in test runner
- Includes mock utilities in `test/mocks/`
- Setup file: `test/setup.js`
