# Interceptor

## Applying

This library is based on axios interceptors, so, under the hood, it uses
`axios.interceptors.use()` to apply the interceptors. But you don't. All you have to do is
call `setupCache` and you are ready to go!

```js
import { setupCache } from 'axios-cache-interceptor';

setupCache(axios);
```

#### How to get the axios instance

There are two types of axios instances, the `AxiosStatic` and the `AxiosInstance`. The
`AxiosStatic` is the default instance of axios. The `AxiosInstance` is the instance you
get when you call `axios.create()`.

Both of them work seamlessly, but when messing with the axios static, your hole code,
_including those libraries you don't know that their exists_, are also affected. **You
should be careful when using it.**

```js
// AxiosStatic
import axios from 'axios';

// AxiosInstance
const instance = axios.create();
```

## Customizing behaviors

You can customize the behaviors of this library in two ways, in a
[per request](pages/per-request-configuration.md) or in a
[global](pages/global-configuration.md) way.

```js #runkit
const Axios = require('axios');
const { setupCache } = require('axios-cache-interceptor');

const instance = Axios.create({
  /** Here you can pass the axios options * */
});

// Global options
setupCache(instance, {
  /** Here you can pass the interceptor options * */
});

// Per request options
const result = await instance.get('https://jsonplaceholder.typicode.com/posts/1', {
  /** Override axios options * */
  cache: {
    /** Override cache options * */
  }
});

console.log('Result:', result.data);
```

## Real world example

An **NodeJS** with **ExpressJS** example to return data from another api.

```js #runkit endpoint
const express = require('express');
const app = express();

const Axios = require('axios');
const { setupCache } = require('axios-cache-interceptor');

const api = setupCache(Axios.create(), {
  baseUrl: 'https://jsonplaceholder.typicode.com/',
  cache: {
    interpretHeader: true, // Cache-Control, Expires, etc.
    ttl: 5 * 60 * 1000, // 5 seconds
    etag: true, // Enables ETag caching
    ifModifiedSince: true // Enables If-Modified-Since caching
  }
});

// Every time an api call reaches here, it will
// make another internal request and forward the response.
app.get('/', (req, res) => {
  api.get('https://jsonplaceholder.typicode.com/users').then(
    ({ data, cached }) => {
      res.json({ cached, data });
    },
    (error) => {
      res.json({ error });
    }
  );
});

app.listen(3000);
```
