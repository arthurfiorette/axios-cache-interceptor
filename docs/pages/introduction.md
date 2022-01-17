# Introduction

## What is this library?

This package is an interceptor for [axios](https://axios-http.com/) that adds caching
capabilities to it. It is a simple, easy to use and powerful library.

You can use it to optimize requests and not have to worry about duplicated requests or
even needing one of those fat javascript libraries for state management.

Axios Cache Interceptor can be understood as an intermediary that will analyze each
request made, check if no similar request has been made before, if so, return it, if not,
wait for the response, warn other requests if they are waiting and return the response.

## Where to start?

- ##### [Installing](pages/installing.md) choose the right bundle to compose in your application.
- ##### [Comparison](pages/comparison.md) see if this package suits all your needs.
- ##### [Usage & Examples](pages/usage-examples.md) check out some examples.
- ##### [Request Configuration](pages/per-request-configuration.md) to make every request unique!
