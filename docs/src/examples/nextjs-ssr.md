# Next.js SSR Example

Server-side rendering considerations with axios-cache-interceptor.

## Different Storage for Server/Client

Use separate storage for server and client:

```ts
// lib/axios.ts
import Axios from 'axios';
import { setupCache, buildMemoryStorage, buildWebStorage } from 'axios-cache-interceptor';

// Server uses memory, client uses localStorage
const storage = typeof window === 'undefined'
  ? buildMemoryStorage({ maxEntries: 100 })
  : buildWebStorage(localStorage);

export const axios = setupCache(Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
}), {
  storage,
  ttl: 1000 * 60 * 5
});
```

## Pages Router

Using with getServerSideProps:

```tsx
// pages/users.tsx
import { axios } from '../lib/axios';
import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await axios.get('/api/users');

  return {
    props: {
      users: response.data,
      cached: response.cached
    }
  };
};

export default function UsersPage({ users, cached }) {
  return (
    <div>
      {cached && <div>Served from cache</div>}
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## App Router

Using with React Server Components:

```tsx
// app/users/page.tsx
import { axios } from '@/lib/axios';

export default async function UsersPage() {
  const response = await axios.get('/api/users');

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {response.data.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Client Components

Using in client components:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { axios } from '@/lib/axios';

export function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/users').then(response => {
      setUsers(response.data);
    });
  }, []);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## API Routes

Cache API route responses:

```ts
// app/api/users/route.ts
import { axios } from '@/lib/axios';
import { NextResponse } from 'next/server';

export async function GET() {
  const response = await axios.get('/external-api/users', {
    cache: {
      ttl: 1000 * 60 * 10 // Cache external API calls
    }
  });

  return NextResponse.json(response.data);
}
```

## Environment Variables

Configure per environment:

```ts
// lib/axios.ts
const config = {
  development: {
    debug: console.log,
    storage: buildMemoryStorage(),
    ttl: 1000 * 10 // Short TTL for dev
  },
  production: {
    debug: undefined,
    storage: typeof window === 'undefined'
      ? buildMemoryStorage({ maxEntries: 200 })
      : buildWebStorage(localStorage),
    ttl: 1000 * 60 * 5
  }
};

export const axios = setupCache(
  Axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL }),
  config[process.env.NODE_ENV]
);
```

## Static Generation

For getStaticProps:

```tsx
// pages/posts/[id].tsx
import { axios } from '@/lib/axios';
import type { GetStaticProps, GetStaticPaths } from 'next';

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await axios.get('/api/posts');

  return {
    paths: response.data.map(post => ({ params: { id: post.id } })),
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const response = await axios.get(`/api/posts/${params.id}`);

  return {
    props: { post: response.data },
    revalidate: 60 // Revalidate every 60 seconds
  };
};
```

## Middleware

Cache external API calls in middleware:

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { axios } from './lib/axios';

export async function middleware(request: NextRequest) {
  // Cache authentication checks
  const response = await axios.get('/api/auth/verify', {
    headers: {
      authorization: request.headers.get('authorization')
    },
    cache: {
      ttl: 1000 * 60, // 1 minute
      vary: ['authorization']
    }
  });

  if (!response.data.valid) {
    return NextResponse.redirect('/login');
  }

  return NextResponse.next();
}
```

## Next Steps

- [React Integration](/examples/react-integration.md) - React-specific patterns
- [Vue Integration](/examples/vue-integration.md) - Vue patterns
- [Testing](/examples/testing-cached-code.md) - Testing strategies
