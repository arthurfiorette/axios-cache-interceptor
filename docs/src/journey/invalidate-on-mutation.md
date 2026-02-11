# Invalidate on Mutation

Learn how to keep your cache fresh after creating, updating, or deleting data.

## The Problem

When using cache-first approaches, data inconsistency becomes a challenge. Consider this scenario:

1. User lists all posts (empty array cached)
2. User creates a new post (server returns 200 OK)
3. User navigates back to post list
4. Post list still shows 0 posts because of cached data
5. Client shows 0 posts, but server has 1 post

## The Solution: cache.update

The `cache.update` option allows you to invalidate or update related caches after a mutation:

```ts
await axios.post('/api/posts', newPost, {
  cache: {
    update: {
      'posts-list': 'delete' // Invalidate the posts list cache
    }
  }
});
```

## Deletion Strategy

The simplest approach is to delete affected cache entries:

```ts
function listPosts() {
  return axios.get('/api/posts', {
    id: 'posts-list' // Custom ID for easy reference
  });
}

function createPost(data) {
  return axios.post('/api/posts', data, {
    cache: {
      update: {
        'posts-list': 'delete' // Force re-fetch on next access
      }
    }
  });
}
```

## Programmatic Update

Instead of deleting, you can programmatically update the cache:

```ts
function createPost(data) {
  return axios.post('/api/posts', data, {
    cache: {
      update: {
        'posts-list': (cachedValue, response) => {
          // Only update if cache exists
          if (cachedValue.state !== 'cached') {
            return 'ignore';
          }

          // Add new post to cached list
          cachedValue.data.posts.push(response.data);

          // Return updated cache
          return cachedValue;
        }
      }
    }
  });
}
```

## Multiple Cache Updates

Update multiple caches in a single mutation:

```ts
function updateUser(userId, data) {
  return axios.put(`/api/users/${userId}`, data, {
    cache: {
      update: {
        'users-list': 'delete',           // Invalidate list
        [`user-${userId}`]: 'delete',     // Invalidate specific user
        'users-count': 'delete'           // Invalidate count
      }
    }
  });
}
```

## Update Return Values

The update function can return:

```ts
type UpdaterResult =
  | 'ignore'            // Don't update this cache
  | 'delete'            // Delete this cache entry
  | NotEmptyStorageValue // Updated cache value
```

Example with conditional logic:

```ts
update: {
  'posts-list': (cache, response) => {
    if (cache.state !== 'cached') {
      return 'ignore'; // Cache doesn't exist or is loading
    }

    if (response.status !== 200) {
      return 'delete'; // Mutation failed, invalidate
    }

    // Update the cache
    cache.data.posts.push(response.data);
    return cache;
  }
}
```

## Centralized Request Management

Organize requests to make cache management easier:

```ts
// api/posts.ts
export const postsApi = {
  list() {
    return axios.get('/api/posts', { id: 'posts-list' });
  },

  get(id) {
    return axios.get(`/api/posts/${id}`, { id: `post-${id}` });
  },

  create(data) {
    return axios.post('/api/posts', data, {
      cache: {
        update: {
          'posts-list': 'delete',
          ...this.invalidatePostDetails(data.id)
        }
      }
    });
  },

  update(id, data) {
    return axios.put(`/api/posts/${id}`, data, {
      cache: {
        update: {
          'posts-list': 'delete',
          [`post-${id}`]: 'delete'
        }
      }
    });
  },

  delete(id) {
    return axios.delete(`/api/posts/${id}`, {
      cache: {
        update: {
          'posts-list': 'delete',
          [`post-${id}`]: 'delete'
        }
      }
    });
  },

  invalidatePostDetails(id) {
    return { [`post-${id}`]: 'delete' as const };
  }
};
```

## External Source Updates

Sometimes data changes from external sources (WebSocket, Server-Sent Events, etc.):

```ts
// Listen for real-time updates
socket.on('post:created', (post) => {
  // Manually invalidate cache
  axios.storage.remove('posts-list');
});

socket.on('post:updated', (post) => {
  axios.storage.remove(`post-${post.id}`);
  axios.storage.remove('posts-list');
});

socket.on('post:deleted', (postId) => {
  axios.storage.remove(`post-${postId}`);
  axios.storage.remove('posts-list');
});
```

## Important Notes

All revalidation methods only work when the request is successful (2xx status codes by default).

For non-standard status codes, configure `validateStatus`:

```ts
axios.post('/api/posts', data, {
  validateStatus: (status) => status < 500, // Accept 4xx as success
  cache: {
    update: {
      'posts-list': 'delete'
    }
  }
});
```

## Next Steps

- [Preventing Stale Data](/journey/preventing-stale-data.md) - TTL and revalidation strategies
- [Cache Keys](/concepts/cache-keys.md) - Understanding request IDs
- [Storage States](/concepts/storage-states.md) - Cache state management
- [cache.update API](/api/request-config.md#cache-update) - Complete API reference
