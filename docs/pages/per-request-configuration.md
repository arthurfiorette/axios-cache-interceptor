# Per-request configuration

By using this axios client and using an ide with intellisense, you'll see a custom
property called `cache`.

The inline documentation is self explanatory, but here are some examples and information:

## `id`

You can override the request id used by this property.
[See more about ids](pages/request-id.md).

## `cache: false`

Setting the `cache` property to `false` will disable the cache for this request.

This does not mean that the cache will be excluded from the storage, in which case, you
can do that by deleting the storage entry:

```js
// Make a request with cache disabled.
const { id: requestId } = await axios.get('url', { cache: false });

// Delete the cache entry for this request.
await axios.storage.remove(requestId);
```

## `cache.ttl`

The time until the cached value is expired in milliseconds.

If a function is used, it will receive the complete response and waits to return a TTL
value

When using `interpretHeader: true`, this value will only be used if the interpreter can't
determine their TTL value to override this

## `cache.interpretHeader`

If activated, when the response is received, the `ttl` property will be inferred from the
requests headers. See the actual implementation of the
[`interpretHeader`](https://github.com/arthurfiorette/axios-cache-interceptor/blob/main/src/header/interpreter.ts)
method for more information. You can override the default behavior by setting the
`headerInterpreter` when creating the cached axios client.

## `cache.methods`

Specify what request methods should be cached.

Defaults to only `GET` methods.

## `cache.cachePredicate`

An object or function that will be tested against the response to test if it can be
cached. See the
[CachePredicate](https://github.com/arthurfiorette/axios-cache-interceptor/blob/main/src/util/types.ts)
type for more.

An simple example with all values:

```ts
axios.get<{ auth: { status: string } }>('url', {
  cache: {
    cachePredicate: {
      // Only cache if the response comes with a *good* status code
      statusCheck: (status) => /* some calculation */ true,

      // Tests against any header present in the response.
      containsHeaders: {
        'x-custom-header-3': (value) => /* some calculation */ true
      },

      // Check custom response body
      responseMatch: ({ data }) => {
        // Sample that only caches if the response is authenticated
        return data.auth.status === 'authenticated';
      }
    }
  }
});
```

## `cache.update`

Once the request is resolved, this specifies what other responses should change their
cache. Can be used to update the request or delete other caches. It is a simple `Record`
with the request id.

Here's an example with some basic login:

```ts
// Some requests id's
let profileInfoId;
let userInfoId;

axios.post<{ auth: { user: User } }>(
  'login',
  { username, password },
  {
    cache: {
      update: {
        // Evicts the profile info cache, because now he is authenticated and the response needs to be re-fetched
        [profileInfoId]: 'delete',

        // An example that update the "user info response cache" when doing a login.
        // Imagine this request is a login one.
        [userInfoResponseId]: (cachedValue, response) => {
          if (cachedValue.state !== 'cached') {
            // Only needs to update if the response is cached
            return 'ignore';
          }

          cachedValue.data = data;

          return cachedValue;
        }
      }
    }
  }
);
```

## `cache.etag`

If the request should handle `ETag` and `If-None-Match support`. Use a string to force a
custom static value or true to use the previous response ETag. To use `true` (automatic
etag handling), `interpretHeader` option must be set to `true`. Default: `false`

## `cache.modifiedSince`

Use `If-Modified-Since` header in this request. Use a date to force a custom static value
or true to use the last cached timestamp. If never cached before, the header is not set.
If `interpretHeader` is set and a `Last-Modified` header is sent then value from that
header is used, otherwise cache creation timestamp will be sent in `If-Modified-Since`.
Default: `true`

## `cache.staleIfError`

Enables cache to be returned if the response comes with an error, either by invalid status
code, network errors and etc. You can filter the type of error that should be stale by
using a predicate function.

**Note**: If the response is treated as error because of invalid status code _(like from
AxiosRequestConfig#invalidateStatus)_, and this ends up `true`, the cache will be
preserved over the "invalid" request. So, if you want to preserve the response, you can
use this predicate:

```js
const customPredicate = (response, cache, error) => {
  // Blocks staleIfError if has a response
  return !response;

  // Note that, this still respects axios default implementation
  // and throws an error, (but it has the response)
};
```

Possible types:

- `number` -> the max time (in seconds) that the cache can be reused.
- `boolean` -> `false` disables and `true` enables with infinite time.
- `function` -> a predicate that can return `number` or `boolean` as described above.

## `cache.override`

This option bypasses the current cache and always make a new http request. This will not
delete the current cache, it will just replace the cache when the response arrives.

Unlike from `cache: false`, this will not disable the cache, it will just ignore the cache
checks before making the request. This way, all options are still available and will work
as expected.

Default: `false`
