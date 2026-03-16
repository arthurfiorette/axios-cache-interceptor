# Installation

Learn how to install axios-cache-interceptor in your project.

## Prerequisites

- Node.js 14 or higher (for npm/pnpm/yarn)
- Axios 1.x or higher
- Basic knowledge of Axios and HTTP requests

## Package Manager Installation

Add Axios Cache Interceptor and Axios to your project using your favorite package manager:

::: code-group

```bash [NPM]
npm install axios@^1 axios-cache-interceptor@^1
```

```bash [Yarn]
yarn add axios@^1 axios-cache-interceptor@^1
```

```bash [pnpm]
pnpm add axios@^1 axios-cache-interceptor@^1
```

:::

## Browser Installation

For browser environments without a build tool:

::: code-group

```html [Development]
<!-- Development UMD build for ES2017+ (~14.2 KiB) -->
<script src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1/dev/index.bundle.js"></script>
```

```html [Production]
<!-- Production UMD build for ES5+ (~16.4 KiB) -->
<script src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1/dist/index.bundle.js"></script>
```

:::

## ES Module CDN

Using Skypack or other ES module CDNs:

```ts
import Axios from 'https://cdn.skypack.dev/axios';
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor';
```

## Version Compatibility

Most of axios v0 breaking changes were about typing issues. **Axios and Axios Cache Interceptor v0 are not compatible with Axios and Axios Cache Interceptor v1.**

| Axios Version | Compatible Interceptor Version |
|---------------|-------------------------------|
| `>= v1.7.8`   | `>= v1.7.0`                   |
| `>= v1.6`     | `>= v1.3.0 && <= v1.6.2`      |
| `>= v1.4`     | `>= v1.2.0`                   |
| `>= v1.3.1`   | `>= v1`                       |

For older Axios versions, see the [full compatibility table](/guide/getting-started#support-table).

## Verification

After installation, verify the package is installed correctly:

```bash
npm list axios-cache-interceptor
```

You should see output similar to:

```
your-project@1.0.0
└── axios-cache-interceptor@1.11.4
```

## Next Steps

- [Your First Cache](/journey/first-cache.md) - Set up your first cached Axios instance
- [API Reference](/api/setup-cache.md) - Learn about setupCache() options
- [Concepts](/concepts/how-it-works.md) - Understand how caching works

## Troubleshooting Installation

### NPM/Yarn/pnpm Issues

If you encounter peer dependency warnings:

```bash
# Use --legacy-peer-deps for npm
npm install --legacy-peer-deps

# Use --force if needed
npm install --force
```

### TypeScript Issues

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

### Browser Global

After including the script tag, the library is available as:

```js
const { setupCache } = window.AxiosCacheInterceptor;
```
