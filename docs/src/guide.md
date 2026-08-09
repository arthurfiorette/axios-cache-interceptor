# Introduction

As its name suggests, Axios Cache Interceptor is an interceptor for Axios that handles caching.
It was created to help developers call axios multiple times without having to worry about
overloading the network or implementing a simple and error-prone cache system.

Each request goes through an interceptor applied to your axios instance. There, we handle
each request and decide if we should send it to the network or return a cached response.

## How it works

By using axios interceptors instead of adapters, each request is passed through the
interceptor before calling the adapter and before returning to the original caller.
Adapters are the final step and they are responsible for the actual network call, so by
choosing to use interceptors, we create a minimally invasive approach that allows you to
still use the axios adapter of your choice.

Before the request is delivered to the adapter, our request interceptor checks whether the
request has already been cached and is valid, whether the request should be cached
(sometimes you don't want cache at all, and that's ok), whether a request has already been
sent to the network that we can wait for, and many other conditions.

After the adapter gets the response, we check if it belongs to a _cacheable_ request,
save it to storage, resolve other requests waiting for the same resource and
finally return the response to the original caller.

## Features

- TTL, Cache-Control and ETag.
- Return previous cached request if the new one failed.
- Handles parallel requests
- 100% Customizable
- Built-in storages like In-Memory, Local Storage and Session Storage.
- Less than 4.3 kB minified and gzipped.
- Development mode to debug your requests.
- 22 times faster than using axios and 8% faster than `axios-cache-adapter`.
- And much more...

## Why not...?

### axios-cache-adapter

The creation of this library is heavily inspired by axios-cache-adapter. It was a great
library but now it is unmaintained and has a lot of unresolved issues. Also, it weighs
more than 4x the size of this library with fewer features and less performance.

### Fetch and some state management library?

As this library was built to be used with axios and to handle storage itself, I can assure you
that it is more performant than any hand-rolled code you may find or write yourself. As for
state management libraries and similar tools,
[this blog post](https://arthur.place/implications-of-cache-or-state) explains why cache
is the more architecturally correct approach than state.
