# Response object

Every response that came from our custom axios instance, will have some extras properties,
that you can retrieve like that:

```js
const result = await cache.get(/* ... */);
const id = result['propertyName'];
```

## `cached`

A simple boolean to check whether this request was cached or not.

**NOTE**: The first response of a request capable of being cached will return
`cached: false`, as only your next requests will return `cached: true`.

## `id`

The [request id](#request-id) resolved. This property represents the ID used throughout
the internal code. Remember that, depending on the
[config.keyGenerator](#configgeneratekey), it can be different as the provided on the
[request.id](#requestid).
