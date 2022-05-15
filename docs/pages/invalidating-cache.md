# Invalidating Cache

A common problem when using a cache-first approach in your client is that there will be
times when your server has newer data, your user knows that it has, but their client
doesn't.

Here's a simple step to step example of it.

1. User list all available posts, server return an empty array.
2. User proceeds to create a new post, server returns 200 OK.
3. Your frontend navigates to the post list page.
4. The post list page still shows 0 posts because it has a fresh cache for that request.
5. User gets angry that the post list page is empty, they click the refresh button.
6. The in-memory cache is vanished and the post list page now shows the created post.

## How to fix it

> You should be familiar with the [Request ID](pages/request-id.md) concept.

There is a [`cache.update`](pages/per-request-configuration.md?id=cacheupdate) option
available for every request that you make. You can resolve this problem in two "major"
ways:

**In these examples, we'll wrap the `list-posts` and `create-post` calls inside known
functions, thus, centralizing the api logic into a single function.**

### Updating the local cache

When you are calling a `create-post` endpoint, it's almost sure that, if the request
succeed, your `list-posts` cache will get out of date.

You can update your `list-posts` cache by using the `cache.update` option in yours
`create-post` requests.

By default, you only need to know the id of the `list-posts` request. There's many ways to
get that information, either by saving the `response.id` in a object or manually defining
the `config.id` in each request.

> This method only works when you are manually making a known request out of date by
> calling another endpoint of your API. Similarly with a `list-posts` and a `create-post`
> request.

```js
function listPosts() {
  return axios.get('/posts', {
    id: 'list-posts'
  });
}

function createPost(data) {
  return axios.post('/posts', data, {
    cache: {
      update: {
        // Will perform a cache update for the `list-posts` internal cache
        'list-posts': (cachedState, createPostResponse) => {
          // If the cache is not cached, we don't need to update it
          if (cachedState.state !== 'cached') {
            return 'ignore';
          }

          // Imagine the server response for the `list-posts` request is: { posts: Post[]; }
          // And the `create-post` response comes with the newly created post.

          // Add the current created post to the end of the post's list
          cachedState.data.posts.push(createPostResponse.data);

          // Return the same cache state, but a updated one.
          return cachedState;
        }
      }
    }
  });
}
```

If you want to update the cache for a specific request outside of the request config, you
can use the storage api.

```ts
if (someLogicThatShowsIfTheCacheShouldBeUpdated) {
  const cache = await axios.storage.get('list-posts');

  // Edits the current cache
  cache.data = '...';

  await axios.storage.set('list-posts', cache);
}
```

Then, every time you create a post, your listPosts function will - without contacting the
server - return the updated list of posts.

### Invalidating the local cache

This method works by completely erasing the local cache and forcing the client, (whenever
needed) request again to your endpoint.

There's about 3 situations that makes this method better than the previous one:

- When you cannot predict the entire data needed.
- When you know that there is newer data available made by another user or service.
- When the data is too bigger or complex to you handle it in your client without the need
  of duplicating hundreds of service classes.

```js
function listPosts() {
  return axios.get('/posts', {
    id: 'list-posts
  });
}

function createPost(data) {
  return axios.post('/posts', data, {
    cache: {
      update: {
        // Will erase the list-posts cache and force the client (when needed) request to the server again
        'list-posts': 'delete'
      }
    }
  });
}
```

If you want to invalidate the cache for a specific request outside of the request config,
you can use the storage api.

```ts
if (someLogicThatShowsIfTheCacheShouldBeInvalidated) {
  // Deletes the current cache
  await axios.storage.remove('list-posts');
}
```
