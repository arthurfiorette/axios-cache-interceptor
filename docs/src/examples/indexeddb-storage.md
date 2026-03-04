# IndexedDB Storage Example

Use IndexedDB for large-scale browser persistent storage.

## Why IndexedDB?

Compared to localStorage:
- Much larger capacity (typically 50MB+)
- Asynchronous API (doesn't block UI)
- Better performance for large datasets
- Support for complex data types

## Installation

```bash
npm install idb-keyval axios-cache-interceptor
```

## Basic Implementation

Using the `idb-keyval` library for simplicity:

```ts
import { buildStorage } from 'axios-cache-interceptor';
import { clear, del, get, set } from 'idb-keyval';

const indexedDBStorage = buildStorage({
  async find(key) {
    const value = await get(key);
    return value ? JSON.parse(value) : undefined;
  },

  async set(key, value) {
    await set(key, JSON.stringify(value));
  },

  async remove(key) {
    await del(key);
  },

  async clear() {
    await clear();
  }
});

export default indexedDBStorage;
```

## Usage

```ts
import { setupCache } from 'axios-cache-interceptor';
import Axios from 'axios';
import indexedDBStorage from './storage/indexeddb';

const axios = setupCache(Axios.create(), {
  storage: indexedDBStorage,
  ttl: 1000 * 60 * 60 // 1 hour
});
```

## Using idb Library

For more control with the `idb` library:

```ts
import { buildStorage } from 'axios-cache-interceptor';
import { openDB, type IDBPDatabase } from 'idb';

// Initialize database
const dbPromise = openDB('axios-cache', 1, {
  upgrade(db) {
    db.createObjectStore('cache');
  }
});

const indexedDBStorage = buildStorage({
  async find(key) {
    const db = await dbPromise;
    return await db.get('cache', key);
  },

  async set(key, value) {
    const db = await dbPromise;
    await db.put('cache', value, key);
  },

  async remove(key) {
    const db = await dbPromise;
    await db.delete('cache', key);
  },

  async clear() {
    const db = await dbPromise;
    await db.clear('cache');
  }
});
```

## With Cleanup

Auto-delete expired entries:

```ts
import { openDB } from 'idb';

const dbPromise = openDB('axios-cache', 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      const store = db.createObjectStore('cache');
      store.createIndex('createdAt', 'createdAt');
    }
  }
});

const indexedDBStorage = buildStorage({
  async find(key) {
    const db = await dbPromise;
    const value = await db.get('cache', key);

    // Check if expired
    if (value && value.state === 'cached') {
      const age = Date.now() - value.createdAt;
      if (age > value.ttl) {
        await db.delete('cache', key);
        return undefined;
      }
    }

    return value;
  },

  async set(key, value) {
    const db = await dbPromise;
    await db.put('cache', value, key);
  },

  async remove(key) {
    const db = await dbPromise;
    await db.delete('cache', key);
  },

  async clear() {
    const db = await dbPromise;
    await db.clear('cache');
  }
});
```

## Complete Example

```tsx
// storage/indexeddb.ts
import { buildStorage } from 'axios-cache-interceptor';
import { openDB } from 'idb';

const dbPromise = openDB('my-app-cache', 1, {
  upgrade(db) {
    db.createObjectStore('axios');
  }
});

export const indexedDBStorage = buildStorage({
  async find(key) {
    const db = await dbPromise;
    return await db.get('axios', key);
  },

  async set(key, value) {
    const db = await dbPromise;
    await db.put('axios', value, key);
  },

  async remove(key) {
    const db = await dbPromise;
    await db.delete('axios', key);
  },

  async clear() {
    const db = await dbPromise;
    await db.clear('axios');
  }
});

// axios.ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { indexedDBStorage } from './storage/indexeddb';

export const axios = setupCache(Axios.create({
  baseURL: 'https://api.example.com'
}), {
  storage: indexedDBStorage,
  ttl: 1000 * 60 * 30 // 30 minutes
});
```

## Error Handling

Handle quota exceeded errors:

```ts
const indexedDBStorage = buildStorage({
  async set(key, value) {
    try {
      const db = await dbPromise;
      await db.put('cache', value, key);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Delete oldest entries and retry
        await cleanupOldEntries();
        const db = await dbPromise;
        await db.put('cache', value, key);
      } else {
        throw error;
      }
    }
  }
});
```

## Next Steps

- [Custom Storage Guide](/journey/custom-storage.md) - Build other adapters
- [Persistent Storage](/journey/persistent-storage.md) - localStorage alternative
- [Storage Interface](/api/storage-interface.md) - API reference
