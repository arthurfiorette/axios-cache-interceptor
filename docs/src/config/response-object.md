# Response object

Every response that came from our custom axios instance will have some extras properties.

```ts
const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');

// response.data
// response.cached
// response.id
// ...
```

Every response that came from our custom axios instance, will have some extras properties,
that you can retrieve like that:

```ts
const result = await cache.get(/* ... */);
const id = result['propertyName'];
```

## `cached`

- Type: `boolean`

A simple boolean that tells you if this request came from the cache or through the
network.

::: tip

This is not a boolean to check wether this request is capable of being cached or not.

:::

## `id`

- Type: `string`

The resolved [request id](../guide/request-id.md). This property represents the ID used
throughout the internal code.

Depending on the [Key Generator](../guide/request-id.md#custom-generator), it can differ
from provided example on the [Request Id](../guide/request-id.md).
