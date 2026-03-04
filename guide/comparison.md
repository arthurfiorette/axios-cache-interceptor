---
url: 'https://axios-cache-interceptor.js.org/guide/comparison.md'
---
# Comparison

> This comparison page aims to be detailed, unbiased, and up-to-date. If you see any
> information that may be inaccurate or could be improved otherwise, please feel free to
> suggest changes.

## Cache Features

```
✅ Supported 1st-class and documented.
🔶 Supported and documented, but requires custom user-code to implement.
🟡 Can be done, may not be documented.
🛑 Not officially supported or documented.
```

|                                                                              | Axios Cache Interceptor |                          Axios Cache Adapter                           |       Cachios        |
| :--------------------------------------------------------------------------: | :---------------------: | :--------------------------------------------------------------------: | :------------------: |
|                               Compared version                               |         Latest          |                                 2.7.3                                  |        3.1.1         |
| Expiration with [TTL](https://developer.mozilla.org/en-US/docs/Glossary/TTL) |           ✅            |                                   ✅                                   |          ✅          |
|                          Per-request configuration                           |           ✅            |                                   ✅                                   |          ✅          |
|                          Global and custom instance                          |           ✅            |                                   ✅                                   |          ✅          |
|                             Cache-Control header                             |           ✅            |                                   ✅                                   |          🛑          |
|                             Expires & Age header                             |           ✅            |                                   🟡                                   |          🛑          |
|                        ETag and If-None-Match header                         |           ✅            |                                   🛑                                   |          🛑          |
|                           If-Modified-Since header                           |           ✅            |                                   🛑                                   |          🛑          |
|                                 Bundle size                                  |    **4.4Kb** (gzip)     |                             18.9Kb (gzip)                              |    19.5Kb (gzip)     |
|                            Typescript declaration                            |  ✅ (Custom interface)  |                         ✅ (Applied globally)                          | ✅(Applied globally) |
|                              Custom cache keys                               |           ✅            |                                   ✅                                   |          ✅          |
|                              Multiple storages                               |           ✅            |                         🔶 (Only localForage)                          |          ✅          |
|                            Built-in redis storage                            |           🔶            |                                   ✅                                   |          🟡          |
|                         Handles storage quota errors                         |           ✅            |                                   ✅                                   |          ✅          |
|                            Node & Web compatible                             |           ✅            |                                   ✅                                   |          🛑          |
|                      Invalidate cache based on response                      |           ✅            |                                   ✅                                   |          🛑          |
|                        Update cache based on response                        |           ✅            |                                   🟡                                   |          🟡          |
|                Predicate to test if request should be cached                 |           ✅            |                                   ✅                                   |          🛑          |
|                             Concurrent requests                              |           ✅            | 🔶[#231](https://github.com/RasCarlito/axios-cache-adapter/issues/231) |          🛑          |
|                       Cache fallback on network errors                       |           ✅            |                                   ✅                                   |          ✅          |
|                           Debug / Development mode                           |           ✅            |                                   ✅                                   |          🛑          |

## Benchmark

The
[benchmark](https://github.com/arthurfiorette/axios-cache-interceptor/blob/main/benchmark/index.js)
is composed of axios throughput tests to compare the performance of this library,
`axios-cache-adapter` and axios as it is.

```md {5,11}
# Result

Run at Sun, 29 Jan 2023 01:24:01 GMT

Commit: 3db90e8c262c48d011fdd53bcda105512434e56e

## CACHE INTERCEPTOR

- Operations: 41275/s
- Network requests: 1 of 205788
- Performance: 100.00%

## CACHE ADAPTER

- Operations: 37683/s
- Network requests: 2 of 185780
- Performance: 91.30%

## AXIOS

- Operations: 1970/s
- Network requests: 9773 of 9773
- Performance: 4.77%

```
