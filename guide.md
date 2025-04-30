---
url: 'https://axios-cache-interceptor.js.org/guide.md'
---
# Introduction

Axios Cache Interceptor is a, as it name says, a interceptor for axios to handle caching.
It was created to help developers call axios multiple times without having to worry about
overloading the network or coding himself a simple and buggy cache system.

Each request goes through an interceptor applied to your axios instance. There, we handle
each request and decide if we should send it to the network or return a cached response.

## How it works

By using axios interceptors instead of adapters, each request is passed through the
interceptor before calling the adapter and before returning to the original caller.
Adapters are the final step and they are responsible for the actual network call, so, by
choosing to use interceptors, we create a minimally invasive approach that allows you to
still use the axios adapter of your choice.

Before the request is delivered to the adapter, our request interceptor checks if the
request have already been cached and if it's a valid one, checks if the request should be
cached (sometimes you don't want cache at all, and it's ok), if there's already a request
sent to the network that we can wait for it and many more other checks.

After the adapter gets the response, we check if it belongs to a *cacheable* request,
saves it into the storage, resolves other requests awaiting for the same resource and
finally returns the response to the original caller.

## Features

* TTL, Cache-Control and ETag.
* Return previous cached request if the new one failed.
* Handles parallel requests
* 100% Customizable
* Built-in storages like In-Memory, Local Storage and Session Storage.
* Less than 4.3Kb minified and gzipped.
* Development mode to debug your requests.
* 22 times faster than using axios and 8% faster than `axios-cache-adapter`.
* And much more...

## Why not...?

### axios-cache-adapter

The creation of this library is heavily inspired by axios-cache-adapter. It was a great
library but now it is unmaintained and has a lot of unresolved issues. Also, it weights
more than 4x the size of this library with less features and less performance.

### Fetch and some state management library?

As this library was built to be used with axios and to handle storage itself, I can assure
that it is more performant that any glued code you may find and/or write yourself. About
state management libraries and other similar things,
[this blog post](https://arthur.place/implications-of-cache-or-state) explains why cache
is more correct, architectural way, instead of state.
