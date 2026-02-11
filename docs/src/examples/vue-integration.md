# Vue Integration

Patterns for using axios-cache-interceptor with Vue 3 and Composition API.

## Basic Setup

Create a cached axios instance:

```ts
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

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { axios } from './api/axios';

const users = ref([]);
const loading = ref(true);

onMounted(async () => {
  const response = await axios.get('/api/users');
  users.value = response.data;
  loading.value = false;
  console.log('Cached:', response.cached);
});
</script>

<template>
  <div v-if="loading">Loading...</div>
  <ul v-else>
    <li v-for="user in users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```

## Composable

Create a reusable composable:

```ts
// composables/useAxiosCache.ts
import { ref, onMounted, type Ref } from 'vue';
import { axios } from '../api/axios';
import type { AxiosRequestConfig, CacheAxiosResponse } from 'axios-cache-interceptor';

export function useAxiosCache<T>(
  url: string,
  config?: AxiosRequestConfig
) {
  const data: Ref<T | null> = ref(null);
  const loading = ref(true);
  const error: Ref<Error | null> = ref(null);
  const cached = ref(false);

  const fetch = async () => {
    loading.value = true;
    try {
      const response: CacheAxiosResponse<T> = await axios.get(url, config);
      data.value = response.data;
      cached.value = response.cached;
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetch);

  return {
    data,
    loading,
    error,
    cached,
    refetch: fetch
  };
}

// Usage in component
<script setup>
import { useAxiosCache } from './composables/useAxiosCache';

const props = defineProps<{ userId: string }>();
const { data: user, loading, cached } = useAxiosCache(`/api/users/${props.userId}`);
</script>
```

## Reactive Cache Invalidation

Invalidate cache after mutations:

```vue
<script setup>
import { ref } from 'vue';
import { axios } from './api/axios';
import { useAxiosCache } from './composables/useAxiosCache';

const { data: users, refetch } = useAxiosCache('/api/users', {
  id: 'users-list'
});

const createUser = async (userData) => {
  await axios.post('/api/users', userData, {
    cache: {
      update: {
        'users-list': 'delete'
      }
    }
  });

  // Refetch after invalidation
  await refetch();
};
</script>

<template>
  <div>
    <UserForm @submit="createUser" />
    <UserList :users="users" />
  </div>
</template>
```

## Stale-While-Revalidate

Show stale data while revalidating:

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { axios } from './api/axios';

const users = ref([]);
const isStale = ref(false);

onMounted(async () => {
  const response = await axios.get('/api/users', {
    cache: {
      hydrate: (staleCache) => {
        users.value = staleCache.data;
        isStale.value = true;
      }
    }
  });

  users.value = response.data;
  isStale.value = false;
});
</script>

<template>
  <div>
    <div v-if="isStale" class="stale-indicator">
      Updating...
    </div>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
  </div>
</template>
```

## Global Axios Instance

Setup in main.ts:

```ts
// main.ts
import { createApp } from 'vue';
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import App from './App.vue';

const axios = setupCache(Axios.create({
  baseURL: import.meta.env.VITE_API_URL
}), {
  ttl: 1000 * 60 * 5
});

const app = createApp(App);

// Make axios available globally
app.config.globalProperties.$axios = axios;

app.mount('#app');
```

Usage in components:

```vue
<script setup>
import { getCurrentInstance, onMounted, ref } from 'vue';

const instance = getCurrentInstance();
const axios = instance?.appContext.config.globalProperties.$axios;

const users = ref([]);

onMounted(async () => {
  const response = await axios.get('/api/users');
  users.value = response.data;
});
</script>
```

## Provide/Inject Pattern

For better type safety:

```ts
// plugins/axios.ts
import type { InjectionKey } from 'vue';
import type { AxiosCacheInstance } from 'axios-cache-interceptor';
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

export const axiosKey: InjectionKey<AxiosCacheInstance> = Symbol('axios');

export const axios = setupCache(Axios.create({
  baseURL: import.meta.env.VITE_API_URL
}));

// main.ts
import { axiosKey, axios } from './plugins/axios';
app.provide(axiosKey, axios);

// Component
<script setup>
import { inject, onMounted, ref } from 'vue';
import { axiosKey } from './plugins/axios';

const axios = inject(axiosKey)!;
const users = ref([]);

onMounted(async () => {
  const response = await axios.get('/api/users');
  users.value = response.data;
});
</script>
```

## Next Steps

- [React Integration](/examples/react-integration.md) - React patterns
- [Next.js SSR](/examples/nextjs-ssr.md) - SSR considerations
- [Testing](/examples/testing-cached-code.md) - Testing strategies
