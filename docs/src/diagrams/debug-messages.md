# Debug Messages Guide

Understanding what each debug message means, why it occurred, and what action is being taken.

::: tip Enable Debug Mode
To see debug messages, import from `/dev` and configure the debug function:
```ts
import { setupCache } from 'axios-cache-interceptor/dev';
const axios = setupCache(Axios, {
  debug: console.log
});
```
:::

## Request Interceptor Messages

### "Ignoring cache because config.cache === false"
- **Meaning**: Caching is disabled for this request
- **Action**: Request proceeds normally without caching
- **Reason**: `config.cache` was explicitly set to `false`

### "Ignored because url matches ignoreUrls"
- **Meaning**: URL is blacklisted from caching
- **Action**: Request proceeds without caching
- **Reason**: URL matches a pattern in `cachePredicate.ignoreUrls`

### "Cached because url matches allowUrls"
- **Meaning**: URL is whitelisted for caching
- **Action**: Continue with cache logic
- **Reason**: URL matches a pattern in `cachePredicate.allowUrls`

### "Ignored because url does not match any allowUrls"
- **Meaning**: URL not in whitelist when whitelist is defined
- **Action**: Request proceeds without caching
- **Reason**: `allowUrls` is configured but URL doesn't match any pattern

### "Ignored because method not in cache.methods"
- **Meaning**: HTTP method not cacheable
- **Action**: Request proceeds without caching
- **Reason**: Method like POST, PUT, DELETE not in `cache.methods` array
- **Note**: Default methods are GET and HEAD only

### "Waiting list had a deferred for this key, waiting for it to finish"
- **Meaning**: Another request for same resource is in progress
- **Action**: Wait for that request to complete
- **Reason**: Prevents duplicate requests for same resource
- **Result**: Will use result from the first request

### "Updated stale request"
- **Meaning**: Added conditional headers to request
- **Action**: Request sent with `If-None-Match` or `If-Modified-Since`
- **Reason**: Have stale data, asking server if it changed
- **Result**: May receive 304 Not Modified if unchanged

### "Sending request, waiting for response"
- **Meaning**: Making actual HTTP request to server
- **Action**: Request proceeds to adapter
- **Reason**: No fresh cache available or override requested
- **States**: Cache state was empty, stale, or must-revalidate

### "Detected concurrent request, waiting for it to finish"
- **Meaning**: Another request for same key is loading
- **Action**: Wait for other request's deferred promise
- **Reason**: Optimizes to avoid duplicate network requests
- **Result**: Will share the result once available

### "Deferred rejected, requesting again"
- **Meaning**: The concurrent request failed
- **Action**: Make a new request instead of using failed result
- **Reason**: Cannot rely on failed request's result
- **Note**: This is a retry mechanism

### "Deferred resolved, but no data was found, requesting again"
- **Meaning**: Cache mismatch - deferred resolved but no data in storage
- **Action**: Make a new request
- **Reason**: Unexpected state, likely storage was cleared mid-request
- **Note**: This should rarely happen

### "Returning cached response"
- **Meaning**: Returning data from cache without HTTP request
- **Action**: Use cached adapter instead of real adapter
- **Reason**: Have fresh cached data
- **Result**: No network request made, instant response

## Response Interceptor Messages

### "Returned cached response"
- **Meaning**: Response came from cache
- **Action**: Return immediately without processing
- **Reason**: `response.cached === true`
- **Note**: Already processed in request interceptor

### "Response with config.cache falsy"
- **Meaning**: Response has no cache config
- **Action**: Return without caching
- **Reason**: Cache was disabled or not configured
- **Note**: Should rarely happen in normal flow

### "Ignored because method not in cache.methods"
- **Meaning**: Response from uncacheable method
- **Action**: Return without caching
- **Reason**: Method not configured for caching
- **Note**: Duplicate check from request interceptor

### "Response not cached and storage isn't loading"
- **Meaning**: Unexpected state mismatch
- **Action**: Return response without caching
- **Reason**: Storage state should be 'loading' but isn't
- **Note**: May indicate request interceptor was bypassed

### "Cache predicate rejected this response"
- **Meaning**: Response doesn't meet caching criteria
- **Action**: Reject cache and remove from storage
- **Reason**: Failed `statusCheck`, `responseMatch`, or `containsHeaders`
- **Example**: Status code not in allowed list (200, 203, 300, etc.)

### "Cache header interpreted as 'dont cache'"
- **Meaning**: Server headers forbid caching
- **Action**: Reject cache and remove from storage
- **Reason**: `Cache-Control: no-cache/no-store` or `private` on server
- **Headers**: Server sent explicit cache prevention directives

### "Useful response configuration found"
- **Meaning**: Successfully calculated cache TTL and config
- **Action**: Proceeding to save to storage
- **Reason**: All validations passed
- **Info**: Contains `cacheConfig` and `cacheResponse` data

### "Found waiting deferred(s) and resolved them"
- **Meaning**: Resolving other waiting requests
- **Action**: Notify concurrent requests that data is ready
- **Reason**: Multiple requests were waiting for this response
- **Result**: All waiting requests now get the cached data

### "Response cached"
- **Meaning**: Successfully saved response to cache
- **Action**: Data now available for future requests
- **Reason**: All caching conditions met
- **State**: Storage state is now 'cached'

## Error Interceptor Messages

### "FATAL: Received non-axios error in rejected interceptor"
- **Meaning**: Unknown error type received
- **Action**: Re-throw error, cannot handle
- **Reason**: Error is not from Axios
- **Impact**: May leave storage in loading state

### "Web request returned error but cache handling not enabled"
- **Meaning**: Error occurred but caching is disabled
- **Action**: Re-throw error
- **Reason**: `config.cache` or `config.id` missing
- **Note**: Normal error flow without cache

### "Caught an error in the request interceptor"
- **Meaning**: Error but storage state is unexpected
- **Action**: Clean up and re-throw
- **Reason**: State not 'loading' or previous not 'stale'
- **Note**: Cannot use `staleIfError` logic

### "Found cache if stale config for rejected response"
- **Meaning**: Evaluating `staleIfError` option
- **Action**: Check if can return stale data instead of error
- **Reason**: `config.staleIfError` is configured
- **Next**: Evaluate if stale data is still usable

### "Found waiting deferred(s) and resolved them" (in error handler)
- **Meaning**: Resolving waiting requests with stale data
- **Action**: Return stale cached data to all waiting requests
- **Reason**: `staleIfError` allowed using stale data
- **Result**: Error avoided by using cached data

### "staleIfError resolved this response with cached data"
- **Meaning**: Returning stale data instead of error
- **Action**: Return cached response marked as stale
- **Reason**: Request failed but stale data acceptable
- **Properties**: `cached: true`, `stale: true`

### "Received unknown error that could not be handled"
- **Meaning**: Error cannot be recovered with `staleIfError`
- **Action**: Reject cache and re-throw error
- **Reason**: `staleIfError` not configured or expired
- **Result**: Error propagates to caller

## Troubleshooting with Debug Messages

### Issue: Not Caching
Look for these messages:
- "Ignoring cache because config.cache === false"
- "Ignored because url matches ignoreUrls"
- "Ignored because url does not match any allowUrls"
- "Ignored because method not in cache.methods"
- "Cache predicate rejected this response"
- "Cache header interpreted as 'dont cache'"

### Issue: Slow Responses
Look for these messages:
- "Sending request, waiting for response" (network request made)
- "Updated stale request" (revalidation happening)
- No "Returning cached response" (cache miss or expired)

### Issue: Unexpected Cached Data
Look for these messages:
- "Returning cached response" (using cache)
- "Returned cached response" (was cached)
- Check the cache TTL in "Response cached" data

### Issue: Concurrent Request Problems
Look for these messages:
- "Detected concurrent request, waiting for it to finish"
- "Waiting list had a deferred for this key"
- "Deferred rejected, requesting again"
- "Found waiting deferred(s) and resolved them"

## Related

- [Request Interceptor Flow](/diagrams/request-interceptor) - Visual flow of request processing
- [Response Interceptor Flow](/diagrams/response-interceptor) - Visual flow of response processing
- [Error Handler Flow](/diagrams/response-error-interceptor) - Visual flow of error handling
- [Debugging Guide](/guide/debugging) - How to enable debug mode
