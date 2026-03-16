# Redis Storage Example

Integrate axios-cache-interceptor with Redis for server-side persistent caching.

## Installation

```bash
npm install ioredis axios-cache-interceptor
```

## Basic Implementation

```ts
import { buildStorage } from 'axios-cache-interceptor';
import Redis from 'ioredis';

const client = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT)
});

const redisStorage = buildStorage({
  async find(key) {
    const value = await client.get(`axios-cache-${key}`);
    return value ? JSON.parse(value) : undefined;
  },

  async set(key, value) {
    await client.set(`axios-cache-${key}`, JSON.stringify(value));
  },

  async remove(key) {
    await client.del(`axios-cache-${key}`);
  },

  async clear() {
    const keys = await client.keys('axios-cache-*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }
});

export default redisStorage;
```

## With Auto-Expiration

Use Redis TTL for automatic cleanup:

```ts
const redisStorage = buildStorage({
  async find(key) {
    const value = await client.get(`axios-cache-${key}`);
    return value ? JSON.parse(value) : undefined;
  },

  async set(key, value, req?) {
    const serialized = JSON.stringify(value);

    // Calculate expiration time
    const ttlMs = value.state === 'loading'
      ? (req?.cache && typeof req.cache.ttl === 'number'
          ? req.cache.ttl
          : 60000) // 1 minute default for loading
      : (value.state === 'cached' || value.state === 'stale')
        ? value.ttl
        : 3600000; // 1 hour default

    // Set with expiration
    await client.setex(
      `axios-cache-${key}`,
      Math.ceil(ttlMs / 1000), // Convert to seconds
      serialized
    );
  },

  async remove(key) {
    await client.del(`axios-cache-${key}`);
  },

  async clear() {
    const keys = await client.keys('axios-cache-*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }
});
```

## Usage

```ts
import { setupCache } from 'axios-cache-interceptor';
import Axios from 'axios';
import redisStorage from './storage/redis';

const axios = setupCache(Axios.create(), {
  storage: redisStorage,
  ttl: 1000 * 60 * 15 // 15 minutes
});

// Caches to Redis
await axios.get('/api/users');
```

## Advanced: Stale Handling

Keep stale entries longer for revalidation:

```ts
async set(key, value, req?) {
  const serialized = JSON.stringify(value);

  let ttlMs: number;

  if (value.state === 'loading') {
    ttlMs = 60000; // 1 minute
  } else if (value.state === 'stale') {
    // Keep stale entries longer for revalidation
    ttlMs = value.ttl * 2;
  } else if (value.state === 'cached') {
    ttlMs = value.ttl;
  } else {
    ttlMs = 3600000;
  }

  await client.setex(
    `axios-cache-${key}`,
    Math.ceil(ttlMs / 1000),
    serialized
  );
}
```

## Connection Pooling

For production:

```ts
import { Redis } from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});
```

## Next Steps

- [Custom Storage Guide](/journey/custom-storage.md) - Build other adapters
- [Storage Interface](/api/storage-interface.md) - Complete reference
- [Production Checklist](/journey/production-checklist.md) - Deployment guide
