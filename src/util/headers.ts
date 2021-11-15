export enum Header {
  /**
   * ```txt
   * If-Modified-Since: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since
   */
  IfModifiedSince = 'if-modified-since',

  /**
   * ```txt
   * Last-Modified: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Last-Modified
   */
  LastModified = 'last-modified',

  /**
   * ```txt
   * If-None-Match: "<etag_value>"
   * If-None-Match: "<etag_value>", "<etag_value>", …
   * If-None-Match: *
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match
   */
  IfNoneMatch = 'if-none-match',

  /**
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
   */
  CacheControl = 'cache-control',

  /**
   * ```txt
   * ETag: W/"<etag_value>"
   * ETag: "<etag_value>"
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
   */
  ETag = 'etag',

  /**
   * ```txt
   * Expires: <http-date>
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires
   */
  Expires = 'expires',

  /**
   * ```txt
   * Age: <delta-seconds>
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Age
   */
  Age = 'age',

  /**
   * ```txt
   * Content-Type: text/html; charset=UTF-8
   * Content-Type: multipart/form-data; boundary=something
   * ```
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
   */
  ContentType = 'content-type',

  /**
   * Used internally to mark the cache item as being revalidatable and
   * enabling stale cache state Contains a string of ASCII characters
   * that can be used as ETag for `If-Match` header Provided by user
   * using `cache.etag` value.
   *
   * ```txt
   * X-Axios-Cache-Etag: "<etag_value>"
   * ```
   */
  XAxiosCacheEtag = 'x-axios-cache-etag',

  /**
   * Used internally to mark the cache item as being revalidatable and
   * enabling stale cache state may contain `'use-cache-timestamp'` if
   * `cache.modifiedSince` is `true`, otherwise will contain a date
   * from `cache.modifiedSince`. If a date is provided, it can be used
   * for `If-Modified-Since` header, otherwise the cache timestamp can
   * be used for `If-Modified-Since` header.
   *
   * ```txt
   * X-Axios-Cache-Last-Modified: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
   * X-Axios-Cache-Last-Modified: use-cache-timestamp
   * ```
   */
  XAxiosCacheLastModified = 'x-axios-cache-last-modified'
}
