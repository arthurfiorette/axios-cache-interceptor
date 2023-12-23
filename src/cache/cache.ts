import type { Method } from 'axios';
import type { Deferred } from 'fast-defer';
import type { HeaderInterpreter } from '../header/types';
import type { AxiosInterceptor } from '../interceptors/build';
import type {
  AxiosStorage,
  CachedResponse,
  CachedStorageValue,
  LoadingStorageValue,
  StaleStorageValue
} from '../storage/types';
import type {
  CachePredicate,
  CacheUpdater,
  KeyGenerator,
  StaleIfErrorPredicate
} from '../util/types';
import type { CacheAxiosResponse, CacheRequestConfig } from './axios';

/**
 * @template R The type returned by this response
 * @template D The type for the request body
 */
export interface CacheProperties<R = unknown, D = unknown> {
  /**
   * The time until the cached value is expired in milliseconds.
   *
   * If a function is used, it will receive the complete response and waits to return a
   * TTL value
   *
   * When using `interpretHeader: true`, this value will only be used if the interpreter
   * can't determine their TTL value to override this
   *
   * @default 1000 * 60 * 5 // 5 Minutes
   * @see https://axios-cache-interceptor.js.org/config/request-specifics#cache-ttl
   */
  ttl: number | ((response: CacheAxiosResponse<R, D>) => number | Promise<number>);

  /**
   * If activated, when the response is received, the `ttl` property will be inferred from
   * the requests headers. As described in the MDN docs and HTML specification.
   *
   * See the actual implementation of the
   * [`interpretHeader`](https://github.com/arthurfiorette/axios-cache-interceptor/blob/main/src/header/interpreter.ts)
   * method for more information.
   *
   * @default true
   * @see https://axios-cache-interceptor.js.org/config/request-specifics#cache-interpretheader
   */
  interpretHeader: boolean;

  /**
   * As most of our cache strategies depends on well known defined HTTP headers, most
   * browsers also use those headers to define their own cache strategies and storages.
   *
   * When your requested routes includes `Cache-Control` in their responses, you may end
   * up with we and your browser caching the response, resulting in a **double layer of
   * cache**.
   *
   * This option solves this by including some predefined headers in the request, that
   * should tell any client / adapter to not cache the response, thus only we will cache
   * it.
   *
   * _These are headers used in our specific request, it won't affect any other request or
   * response that the server may handle._*
   *
   * Headers included:
   *
   * - `Cache-Control: no-cache`
   * - `Pragma: no-cache`
   * - `Expires: 0`
   *
   * Learn more at
   * [#437](https://github.com/arthurfiorette/axios-cache-interceptor/issues/437#issuecomment-1361262194)
   * and in this [StackOverflow](https://stackoverflow.com/a/62781874/14681561) answer.
   *
   * @default true
   * @see https://axios-cache-interceptor.js.org/config/request-specifics#cache-cachetakeover
   */
  cacheTakeover: boolean;

  /**
   * Specifies which methods we should handle and cache. This is where you can enable
   * caching to `POST`, `PUT`, `DELETE` and other methods, as the default is only `GET`.
   *
   * We use `methods` in a per-request configuration setup because sometimes you have
   * exceptions to the method rule.
   *
   * @default ['get']
   * @see https://axios-cache-interceptor.js.org/config/request-specifics#cache-methods
   */
  methods: Lowercase<Method>[];

  /**
   * An object or function that will be tested against the response to indicate if it can
   * be cached.
   *
   * @default { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) }
   * @see https://axios-cache-interceptor.js.org/config/request-specifics#cache-cachepredicate
   */
  cachePredicate: CachePredicate<R, D>;

  /**
   * Once the request is resolved, this specifies what other responses should change their
   * cache. Can be used to update the request or delete other caches. It is a simple
   * `Record` with the request id.
   *
   * Here's an example with some basic login:
   *
   * Using a function instead of an object is supported but not recommended, as it's
   * better to just consume the response normally and write your own code after it. But
   * it`s here in case you need it.
   *
   * @default {{}}
   * @see https://axios-cache-interceptor.js.org/config/request-specifics#cache-update
   */
  update: CacheUpdater<R, D>;

  /**
   * If the request should handle
   * [`ETag`](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/ETag) and
   * [`If-None-Match
   * support`](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/If-None-Match).
   * Use a string to force a custom static value or true to use the previous response
   * ETag.
   *
   * To use `true` (automatic ETag handling), `interpretHeader` option must be set to
   * `true`.
   *
   * @default true
   * @see https://axios-cache-interceptor.js.org/config/request-specifics#cache-etag
   */
  etag: string | boolean;

  /**
   * Use
   * [`If-Modified-Since`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since)
   * header in this request. Use a date to force a custom static value or true to use the
   * last cached timestamp.
   *
   * If never cached before, the header is not set.
   *
   * If `interpretHeader` is set and a
   * [`Last-Modified`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Last-Modified)
   * header is sent to us, then value from that header is used, otherwise cache creation
   * timestamp will be sent in
   * [`If-Modified-Since`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since).
   *
   * @default false // The opposite of the resulting `etag` option.
   * @see https://axios-cache-interceptor.js.org/config/request-specifics#cache-modifiedsince
   */
  modifiedSince: Date | boolean;

  /**
   * Enables cache to be returned if the response comes with an error, either by invalid
   * status code, network errors and etc. You can filter the type of error that should be
   * stale by using a predicate function.
   *
   * **If the response is treated as error because of invalid status code _(like when
   * using
   * [statusCheck](https://axios-cache-interceptor.js.org/config/request-specifics#cache-cachepredicate))_,
   * and this ends up `true`, the cache will be preserved over the "invalid" request.**
   *
   * Types:
   *
   * - `number` -> the max time (in seconds) that the cache can be reused.
   * - `boolean` -> `false` disables and `true` enables with infinite time if no value is
   *   present on `stale-if-error` in Cache-Control.
   * - `function` -> a predicate that can return `number` or `boolean` as described above.
   *
   * @default true
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-if-error
   */
  staleIfError: StaleIfErrorPredicate<R, D>;

  /**
   * This option bypasses the current cache and always make a new http request. This will
   * not delete the current cache, it will just replace the cache when the response
   * arrives.
   *
   * Unlike as `cache: false`, this will not disable the cache, it will just ignore the
   * pre-request cache checks before making the request. This way, all post-request
   * options are still available and will work as expected.
   *
   * @default false
   * @see https://axios-cache-interceptor.js.org/config/request-specifics#cache-override
   */
  override: boolean;

  /**
   * Asynchronously called when a network request is needed to resolve the data, but an
   * older one **and probably expired** cache exists. Its with the current data **BEFORE**
   * the network travel starts, so you can use it to temporarily update your UI with
   * expired data before the network returns.
   *
   * Hydrating your components with old data before the network resolves with the newer
   * one is better than _flickering_ your entire UI. This is even better when dealing with
   * slower networks and persisted cache, like for mobile apps.
   *
   * If the request can return cached data, as no extensive network travel is needed, the
   * hydrate **IS NOT CALLED**, as the axios promise will be resolved instantly.
   *
   * @default undefined
   * @see https://axios-cache-interceptor.js.org/config/request-specifics#cache-hydrate
   */
  hydrate:
    | undefined
    | ((
        cache:
          | (LoadingStorageValue & { previous: 'stale' })
          | CachedStorageValue
          | StaleStorageValue
      ) => void | Promise<void>);
}

/**
 * These are properties that are used and shared by the entire application.
 *
 * ```ts
 * const axios = setupCache(axios, OPTIONS);
 * ```
 *
 * The `setupCache` function receives global options and all [request
 * specifics](https://axios-cache-interceptor.js.org/config/request-specifics) ones too.
 * This way, you can customize the defaults for all requests.
 *
 * @see https://axios-cache-interceptor.js.org/config/request-specifics
 */
export interface CacheInstance {
  /**
   * A storage interface is the entity responsible for saving, retrieving and serializing
   * data received from network and requested when a axios call is made.
   *
   * See the [Storages](https://axios-cache-interceptor.js.org/guide/storages) page for
   * more information.
   *
   * @default buildMemoryStorage
   * @see https://axios-cache-interceptor.js.org/config#storage
   */
  storage: AxiosStorage;

  /**
   * The function used to create different keys for each request. Defaults to a function
   * that priorizes the id, and if not specified, a string is generated using the
   * `method`, `baseURL`, `params`, `data` and `url`.
   *
   * You can learn on how to use them on the [Request
   * ID](https://axios-cache-interceptor.js.org/guide/request-id#custom-generator) page.
   *
   * @default defaultKeyGenerator
   * @see https://axios-cache-interceptor.js.org/config#generatekey
   */
  generateKey: KeyGenerator;

  /**
   * A simple object that will hold a promise for each pending request. Used to handle
   * concurrent requests.
   *
   * You'd normally not need to change this, but it is exposed in case you need to use it
   * as some sort of listener of know when a request is waiting for other to finish.
   *
   * @default { }
   * @see https://axios-cache-interceptor.js.org/config#waiting
   */
  waiting: Record<string, Deferred<CachedResponse>>;

  /**
   * The function used to interpret all headers from a request and determine a time to
   * live (`ttl`) number.
   *
   * **Many REST backends returns some variation of `Cache-Control: no-cache` or
   * `Cache-Control: no-store` headers, which tell us to ignore caching at all. You shall
   * disable `headerInterpreter` for those requests.**
   *
   * **If the debug mode prints `Cache header interpreted as 'dont cache'` this is
   * probably the reason.**
   *
   * The possible returns are:
   *
   * - `'dont cache'`: the request will not be cached.
   * - `'not enough headers'`: the request will find other ways to determine the TTL value.
   * - `number`: used as the TTL value.
   *
   * @default defaultHeaderInterpreter
   * @see https://axios-cache-interceptor.js.org/config#headerinterpreter
   */
  headerInterpreter: HeaderInterpreter;

  /**
   * The function that will be used to intercept the request before it is sent to the
   * axios adapter.
   *
   * It is the main function of this library, as it is the bridge between the axios
   * request and the cache.
   *
   * _It wasn't meant to be changed, but if you need to, you can do it by passing a new
   * function to this property._*
   *
   * See its code for more information
   * [here](https://github.com/arthurfiorette/axios-cache-interceptor/tree/main/src/interceptors).
   *
   * @default defaultRequestInterceptor
   * @see https://axios-cache-interceptor.js.org/config#requestinterceptor
   */
  requestInterceptor: AxiosInterceptor<CacheRequestConfig<unknown, unknown>>;

  /**
   * The function that will be used to intercept the request after it is returned by the
   * axios adapter.
   *
   * It is the second most important function of this library, as it is the bridge between
   * the axios response and the cache.
   *
   * _It wasn't meant to be changed, but if you need to, you can do it by passing a new
   * function to this property._*
   *
   * See its code for more information
   * [here](https://github.com/arthurfiorette/axios-cache-interceptor/tree/main/src/interceptors).
   *
   * @default defaultResponseInterceptor
   * @see https://axios-cache-interceptor.js.org/config#responseinterceptor
   */
  responseInterceptor: AxiosInterceptor<CacheAxiosResponse<unknown, unknown>>;

  /**
   * The debug option will print debug information in the console. It is good if you need
   * to trace any undesired behavior or issue. You can enable it by setting `debug` to a
   * function that receives an string and returns nothing.
   *
   * Read the [Debugging](https://axios-cache-interceptor.js.org/guide/debugging) page for
   * the complete guide.
   *
   * @default noop function
   * @see https://axios-cache-interceptor.js.org/#/pages/development-mode
   */
  debug: (this: void, msg: DebugObject) => void;
}

/**
 * An object with any possible type that can be used to log and debug information in
 * `development` mode _(a.k.a `__ACI_DEV__ === true`)_
 *
 * @see https://axios-cache-interceptor.js.org/#/pages/development-mode
 */
export interface DebugObject {
  id?: string;
  msg?: string;
  data?: unknown;
}
