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
   * ETag: W / '<etag_value>';
   * ETag: '<etag_value>';
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
  ContentType = 'content-type'
}
