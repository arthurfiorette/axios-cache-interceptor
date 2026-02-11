# React Integration

Patterns for using axios-cache-interceptor with React.

## Basic Setup

Create a cached axios instance:

```tsx
// api/axios.ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

export const axios = setupCache(Axios.create({
  baseURL: 'https://api.example.com'
}), {
  ttl: 1000 * 60 * 5 // 5 minutes
});
```

## Using in Components

```tsx
import { useState, useEffect } from 'react';
import { axios } from './api/axios';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/users')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
        console.log('Cached:', response.cached);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

## Custom Hook

Create a reusable hook:

```tsx
import { useState, useEffect } from 'react';
import { axios } from './api/axios';
import type { AxiosRequestConfig, CacheAxiosResponse } from 'axios-cache-interceptor';

function useAxiosCache<T>(
  url: string,
  config?: AxiosRequestConfig
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    let cancelled = false;

    axios.get<T>(url, config)
      .then((response: CacheAxiosResponse<T>) => {
        if (!cancelled) {
          setData(response.data);
          setCached(response.cached);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error, cached };
}

// Usage
function UserProfile({ userId }) {
  const { data: user, loading, cached } = useAxiosCache(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1>{user.name}</h1>
      {cached && <small>Cached data</small>}
    </div>
  );
}
```

## With Stale-While-Revalidate

Show stale data while fetching fresh:

```tsx
import { useState, useEffect } from 'react';
import { axios } from './api/axios';

function UserList() {
  const [users, setUsers] = useState([]);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    axios.get('/api/users', {
      cache: {
        hydrate: (staleCache) => {
          // Update with stale data immediately
          setUsers(staleCache.data);
          setIsStale(true);
        }
      }
    }).then(response => {
      // Update with fresh data
      setUsers(response.data);
      setIsStale(false);
    });
  }, []);

  return (
    <div>
      {isStale && <div>Loading fresh data...</div>}
      <ul>
        {users.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </div>
  );
}
```

## Cache Invalidation

Invalidate cache after mutations:

```tsx
import { axios } from './api/axios';

function CreateUserForm() {
  const handleSubmit = async (userData) => {
    // Create user and invalidate users list
    await axios.post('/api/users', userData, {
      cache: {
        update: {
          'users-list': 'delete' // Clear users list cache
        }
      }
    });

    // Navigate or refresh
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

function UsersList() {
  useEffect(() => {
    axios.get('/api/users', {
      id: 'users-list' // Use consistent ID
    }).then(/* ... */);
  }, []);
}
```

## React Query Alternative

For comparison, using with React Query:

```tsx
import { useQuery } from '@tanstack/react-query';
import { axios } from './api/axios';

function UserList() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => axios.get('/api/users').then(res => res.data)
  });

  // React Query handles its own caching
  // axios-cache-interceptor adds network-level caching on top
  if (isLoading) return <div>Loading...</div>;
  return <ul>{data.map(user => <li key={user.id}>{user.name}</li>)}</ul>;
}
```

## SSR Considerations

For Next.js or server rendering:

```tsx
// Use different storage for server vs client
const storage = typeof window === 'undefined'
  ? buildMemoryStorage() // Server
  : buildWebStorage(localStorage); // Client

export const axios = setupCache(Axios.create(), {
  storage
});
```

## Next Steps

- [Vue Integration](/examples/vue-integration.md) - Vue-specific patterns
- [Next.js SSR](/examples/nextjs-ssr.md) - Server-side rendering
- [Testing](/examples/testing-cached-code.md) - Testing cached components
