import type { Deferred } from 'fast-defer';
import type { AxiosCacheInstance, InternalCacheRequestConfig } from '../cache/axios.js';

/**
 * Creates and manages a timeout for a waiting entry to prevent memory leaks.
 * The timeout automatically cleans up waiting entries that are not resolved
 * within the specified time period.
 *
 * The timeout value is determined by:
 * 1. config.timeout if set and > 0
 * 2. axios.defaults.timeout if set and > 0
 * 3. No timeout (returns undefined) otherwise
 *
 * @param axios - The axios cache instance
 * @param id - The request ID
 * @param def - The deferred promise
 * @param config - The request configuration
 * @returns The timeout ID (for cleanup purposes) or undefined if no timeout is set
 */
export function createWaitingTimeout(
  axios: AxiosCacheInstance,
  id: string,
  def: Deferred<void>,
  config: InternalCacheRequestConfig
): ReturnType<typeof setTimeout> | undefined {
  // Determine timeout value: prefer config.timeout, then axios.defaults.timeout
  // Note: axios defaults timeout to 0, which means no timeout
  const configTimeout = config.timeout;
  const defaultTimeout = axios.defaults.timeout;
  const timeout =
    configTimeout && configTimeout > 0
      ? configTimeout
      : defaultTimeout && defaultTimeout > 0
        ? defaultTimeout
        : undefined;

  // Only create timeout if we have a valid value
  if (!timeout || timeout <= 0) {
    return undefined;
  }

  const timeoutId = setTimeout(() => {
    const waiting = axios.waiting.get(id);
    if (waiting === def) {
      waiting.reject(new Error('Request timeout - waiting entry cleaned up'));
      axios.waiting.delete(id);

      if (__ACI_DEV__) {
        axios.debug({
          id,
          msg: 'Cleaned up waiting entry due to timeout'
        });
      }
    }
  }, timeout);

  // In Node.js, unref the timeout to prevent it from keeping the process alive
  // This is safe because the timeout is only for cleanup purposes
  if (typeof timeoutId === 'object' && 'unref' in timeoutId) {
    timeoutId.unref();
  }

  return timeoutId;
}
