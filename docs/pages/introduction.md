# Axios Cache Interceptor

This package is an interceptor for [axios](https://axios-http.com/) that adds caching
capabilities to it. It is a simple, easy to use and powerful library.

You can use it to optimize requests and not have to worry about duplicated requests or
even needing one of those fat javascript libraries for state management.

Axios Cache Interceptor can be understood as an intermediary that will analyze each
request made, check if no similar request has been made before, if so, return it, if not,
wait for the response, warn other requests if they are waiting and return the response to
the original caller.

## Where to start

- [Installing](pages/installing.md)
- [Configuration](pages/configuration.md)
- [Per request configuration](pages/per-request-configuration)
- [A NodeJS Server example](pages/examples?id=nodejs-server)
- [A React Component example](pages/examples?id=react-server)
