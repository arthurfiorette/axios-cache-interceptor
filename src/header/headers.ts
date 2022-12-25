export const Header = Object.freeze({
  /**
   * ```txt
   * If-Modified-Since: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since
   */
  IfModifiedSince: 'if-modified-since',

  /**
   * ```txt
   * Last-Modified: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Last-Modified
   */
  LastModified: 'last-modified',

  /**
   * ```txt
   * If-None-Match: "<etag_value>"
   * If-None-Match: "<etag_value>", "<etag_value>", …
   * If-None-Match: *
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match
   */
  IfNoneMatch: 'if-none-match',

  /**
   * ```txt
   * Cache-Control: max-age=604800
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
   */
  CacheControl: 'cache-control',

  /**
   * ```txt
   * Pragma: no - cache;
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Pragma
   */
  Pragma: 'pragma',

  /**
   * ```txt
   * ETag: W / '<etag_value>';
   * ETag: '<etag_value>';
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
   */
  ETag: 'etag',

  /**
   * ```txt
   * Expires: <http-date>
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires
   */
  Expires: 'expires',

  /**
   * ```txt
   * Age: <delta-seconds>
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Age
   */
  Age: 'age',

  /**
   * Used internally as metadata to mark the cache item as revalidatable and enabling
   * stale cache state Contains a string of ASCII characters that can be used as ETag for
   * `If-Match` header Provided by user using `cache.etag` value.
   *
   * ```txt
   * X-Axios-Cache-Etag: "<etag_value>"
   * ```
   */
  XAxiosCacheEtag: 'x-axios-cache-etag',

  /**
   * Used internally as metadata to mark the cache item as revalidatable and enabling
   * stale cache state may contain `'use-cache-timestamp'` if `cache.modifiedSince` is
   * `true`, otherwise will contain a date from `cache.modifiedSince`. If a date is
   * provided, it can be used for `If-Modified-Since` header, otherwise the cache
   * timestamp can be used for `If-Modified-Since` header.
   *
   * ```txt
   * X-Axios-Cache-Last-Modified: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
   * X-Axios-Cache-Last-Modified: use-cache-timestamp
   * ```
   */
  XAxiosCacheLastModified: 'x-axios-cache-last-modified',

  /**
   * Used internally as metadata to mark the cache item able to be used if the server
   * returns an error. The stale-if-error response directive indicates that the cache can
   * reuse a stale response when any error occurs.
   *
   * ```txt
   * XAxiosCacheStaleIfError: <seconds>
   * ```
   */
  XAxiosCacheStaleIfError: 'x-axios-cache-stale-if-error'
});
