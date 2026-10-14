---
url: https://axios-cache-interceptor.js.org/guide/invalidating-cache.md
---
# Invalidating cache

With a cache-first approach, data inconsistency becomes your main problem. **You** can change
data on the server, and so can **others**. Without asking the server, there is no way to know
the current state of the data.

::: warning

**All revalidation methods below only run when the request succeeds.**

To revalidate after a non-`2XX` status code, accept that status in axios's
[`validateStatus`](https://axios-http.com/docs/handling_errors) or revalidate manually as
shown [below](#through-external-sources).

:::

Consider this example:

1. The user lists all posts, and the server returns an empty array.
2. The user creates a new post, and the server returns 200 OK.
3. Your frontend navigates back to the post list page.
4. The page still shows 0 posts, because the list request was recently cached.
5. Your client shows 0 posts, but the server has 1.

## Revalidation after mutation

Most of the time, your own client causes the inconsistency, as in the example above, where it
sent the mutation request itself. In that case, you can invalidate the cache of every entry
the mutation changed.

**The `cache.update` option is available on every request, and it is the main tool for
invalidation.**

::: tip

Wrapping each request in its own function makes it easier to keep track of the custom IDs
each request uses, and to reference and invalidate them later.

:::

## Programmatically

If the mutation made a simple change, you can use the mutation response to update your cache
directly.

In the example above, you only need to push the new post into the `list-posts` cache entry.

```ts
// Uses the `list-posts` ID so it can be referenced later.
function listPosts() {
  return axios.get('/posts', {
    id: 'list-posts'
  });
}

function createPost(data) {
  return axios.post(
    '/posts',
    data,
    /* [!code focus:25] */ {
      cache: {
        update: {
          // Updates the cache entry of the `list-posts` request.
          'list-posts': (listPostsCache, createPostResponse) => {
            // Nothing to update if the entry is not cached
            if (listPostsCache.state !== 'cached') {
              return 'ignore';
            }

            // Assume the `list-posts` response body is { posts: Post[] }
            // and the create post response body is the new post.

            // Adds the new post to the end of the cached list
            listPostsCache.data.data.posts.push(createPostResponse.data);

            // Returns the updated cache entry to be stored.
            return listPostsCache;
          }
        }
      }
    }
  );
}
```

This updates the `list-posts` cache on the client so it matches the server. When an update
like this is possible, prefer it, because it doesn't need another request to the server.

::: tip

**Note to Vue users:** with the default memory storage, the cached array is the same object
that the previous request returned. If you modify it as shown above and assign the response
data to a Vue `ref`, the UI may not update. Copy the array before modifying it:

```ts
const posts = listPostsCache.data.data.posts;

listPostsCache.data.data.posts = [...posts];
listPostsCache.data.data.posts.push(createPostResponse.data);
// or
listPostsCache.data.data.posts = [...posts, createPostResponse.data];
```

Or copy it before assigning it to the `ref`:

```ts
const response = await axios.get('/posts', { id: 'list-posts' });
myRef.value = [...response.data.posts];
```

You can also build the memory storage with `cloneData` enabled, so every read returns a copy.
See [Memory Storage](./storages.md#memory-storage).

:::

## Through network

Sometimes the mutation is complex enough that replicating every change the backend made would
duplicate a lot of service code and become hard to maintain.

In those cases, invalidate the cache and let the next request go to the server, which updates
the cache with the new response.

```ts
// Uses the `list-posts` ID so it can be referenced later.
function listPosts() {
  return axios.get('/posts', {
    // [!code focus:3]
    id: 'list-posts'
  });
}

function createPost(data) {
  return axios.post('/posts', data, {
    // [!code focus:9]
    cache: {
      update: {
        // Calls storage.remove('list-posts') internally, so the
        // next request goes to the server without any extra
        // checks on your side.
        'list-posts': 'delete'
      }
    }
  });
}
```

In the first example, at step **3**, the axios-cache-interceptor instance requests the posts
from the server again and updates the cache before the promise resolves and your page renders.

## Through external sources

If you receive changes from somewhere else, such as a WebSocket listener, you may want to
update the axios cache outside of a request.

For that, use the storage directly:

```ts
if (someLogicThatShowsIfTheCacheShouldBeInvalidated) {
  // Deletes the cache entry of the `list-posts` request.
  await axios.storage.remove('list-posts');
}

if (someLogicThatShowsIfTheCacheShouldBeInvalidated) {
  // Deletes all cached data. `clear` is optional for custom storages.
  await axios.storage.clear?.();
}
```

## Keeping cache up to date

If someone else changed the data, your client may not know about it. In a chat application,
for example, your client may not know that someone sent you a new message.

When you have **no** way to know that the cache is outdated, set a shorter time to live (TTL)
for those requests.

```ts
// Uses the `list-posts` ID so it can be referenced later.
function listPosts() {
  return axios.get('/posts', {
    id: 'list-posts',
    cache: {
      ttl: 1000 * 60 // 1 minute.
    }
  });
}

function createPost(data) {
  return axios.post('/posts', data, {
    cache: {
      update: {
        // Still delete the cache when I KNOW things have changed.
        // Unless the server sends its own cache headers, the
        // cache is at most 1 minute out of date.
        'list-posts': 'delete'
      }
    }
  });
}
```

## Choosing a strategy

Any cache trades data consistency for performance, and most of the time that trade is worth
it.

*The best strategy usually combines several approaches: TTL, invalidation after mutations,
stale-while-revalidate and the others on this page.*

Weigh how much inconsistency you can accept against the performance you want to gain;
sometimes that means not caching at all.
