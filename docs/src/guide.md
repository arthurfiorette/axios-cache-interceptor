# Introduction

Axios Cache Interceptor is an axios interceptor that caches responses. It lets you call axios
as often as you need without overloading the network or writing your own error-prone cache.

Every request made through your axios instance passes through the interceptor, which decides
whether to send it to the network or answer it with a cached response.

## How it works

Axios runs interceptors before calling the adapter and again before returning the response
to the caller. The adapter is the last step and performs the actual network call. Because
this library is built on interceptors instead of a custom adapter, you can keep using any
axios adapter you want.

Before a request reaches the adapter, the request interceptor checks, among other
conditions:

- whether a valid cached response already exists;
- whether the request should be cached at all (sometimes you don't want caching, and that's
  fine);
- whether an identical request is already in flight, so this one can wait for its result.

After the adapter returns a response, the response interceptor checks whether it belongs to
a _cacheable_ request, saves it to storage, resolves other requests waiting for the same
resource and returns the response to the original caller.

## Features

- TTL, `Cache-Control`, `ETag`, `Last-Modified` and `Vary` support.
- Returns the previous cached response when a new request fails.
- Deduplicates concurrent requests for the same resource.
- Configurable globally and per request.
- Built-in in-memory, `localStorage` and `sessionStorage` storages.
- Production UMD bundle of about 18 KiB minified (about 7 KiB gzipped), dependencies included.
- A development build that logs why each request was or wasn't cached.
- In a 2023 benchmark with cached responses, served about 21x more requests per second than
  plain axios and about 9% more than `axios-cache-adapter`.

## Alternatives

### axios-cache-adapter

This library was heavily inspired by axios-cache-adapter. That library was good, but it is
now unmaintained and has many unresolved issues. It is also larger than this library, with
fewer features and lower performance.

### Fetch with a state management library

This library was built specifically for axios and manages its own storage, request
deduplication and HTTP caching headers, which hand-rolled caches rarely cover. For state
management libraries and similar tools,
[this blog post](https://arthur.place/implications-of-cache-or-state) explains why a cache is
a better architectural fit than state.
