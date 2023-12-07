# Invalidating Cache

When using cache-first approaches to improve performance, data inconsistency becomes your
major problem. That occurs because **you** can mutate data in the server and **others**
also can too. It becomes impossible to really know what the current state of the data is in
real time without communicating with the server.

::: warning

**All available revalidation methods only work when the request is successful.**

If you are wanting to revalidate with a non standard `2XX` status code, make sure to
enable it at [`validateStatus`](https://axios-http.com/docs/handling_errors) or revalidate
it manually as shown [below](#updating-cache-through-external-sources).

:::

Take a look at this simple example:

1. User lists all available posts, the server returns an empty array.
2. User proceeds to create a new post, server returns 200 OK.
3. Your frontend navigates to the post list page.
4. The post list page still shows 0 posts because it had a recent cache for that request.
5. Your client shows 0 posts, but the server actually has 1 post.

## Revalidation after mutation

In most cases, you are the one responsible for that inconsistency, like in the above
example when the client itself initiated the mutation request. When that happens, you are
capable of invalidating the cache for all places you have changed too.

**The `cache.update` option is available for every request that you make, and it will be
the go-to tool for invalidation.**

::: tip

By centralizing your requests into separate methods, you are more likely to keep track of
custom IDs you use for each request, thus making it easier to reference and invalidate
after.

:::

## Programmatically

If the mutation you made was just simple changes, you can get the mutation response and
programmatically update your cache.

Again considering the first example, we can just do an `array.push` to the `list-posts`
cache and we are good to go.

```ts
// Uses `list-posts` id to be able to reference it later.
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
          // Will perform a cache update for the `list-posts` respective
          // cache entry.
          'list-posts': (listPostsCache, createPostResponse) => {
            // If the cache is does not has a cached state, we don't need
            // to update it
            if (listPostsCache.state !== 'cached') {
              return 'ignore';
            }

            // Imagine the server response for the `list-posts` request
            // is: { posts: Post[]; }, and the `create-post` response
            // comes with the newly created post.

            // Adds the created post to the end of the post's list
            listPostsCache.data.posts.push(createPostResponse.data);

            // Return the same cache state, but a updated one.
            return listPostsCache;
          }
        }
      }
    }
  );
}
```

This will update the `list-posts` cache at the client side, making it equal to the server.
When operations like this are possible to be made, they are the preferred. That's because
we do not contact the server again and update ourselves the cache.

## Through network

Sometimes, the mutation you made is not simple enough and would need a lot of copied
service code to replicate all changes the backend made, turning it into a duplication and
maintenance nightmare.

In those cases, you can just invalidate the cache and let the next request be forwarded to
the server, and update the cache with the new network response.

```ts
// Uses `list-posts` id to be able to reference it later.
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
        // Internally calls the storage.remove('list-posts') and lets the
        // next request be forwarded to the server without you having to
        // do any checks.
        'list-posts': 'delete'
      }
    }
  });
}
```

Still using the first example, while we are at the step **3**, automatically, the axios
cache-interceptor instance will request the server again and do required changes in the
cache before the promise resolves and your page gets rendered.

## Through external sources

If you have any other type of external communication, like when listening to a websocket
for changes, you may want to update your axios cache without be in a request context.

For that, you can operate the storage manually. It is simple as that:

```ts
if (someLogicThatShowsIfTheCacheShouldBeInvalidated) {
  // Deletes the current cache for the `list-posts` respective request.
  await axios.storage.remove('list-posts');
}
```

## Keeping cache up to date

If you were **not** the one responsible for that change, your client may not be aware that
it has changed. E.g. When you are using a chat application, you may not be aware that a
new message was sent to you.

In such cases that we **do not** have a way to know that the cache is outdated, you may have to
end up setting a custom time to live (TTL) for specific requests.

```ts
// Uses `list-posts` id to be able to reference it later.
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
        // I still want to delete the cache when I KNOW things have
        // changed, but, by setting a TTL of 1 minute, I ensure that
        // 1 minute is the highest time interval that the cache MAY
        // get outdated.
        'list-posts': 'delete'
      }
    }
  });
}
```

## Summing up

When applying any kind of cache to any kind of application, you chose to trade data
consistency for performance. And, most of the time that is OK.

_The best cache strategy is a combination of all of them. TTL, custom revalidation, stale
while revalidate and all the others together are the best solution._

The only real tip here is to you put on a scale the amount of inconsistency you are
willing to give up for the performance you are willing to gain. **Sometimes, not caching
is the best solution.**
