import type { Deferred } from 'fast-defer';
import type { AxiosCacheInstance } from '../cache/axios.js';

/**
 * Creates and manages a timeout for a waiting entry to prevent memory leaks.
 * The timeout automatically cleans up waiting entries that are not resolved
 * within the specified time period.
 *
 * @param axios - The axios cache instance
 * @param id - The request ID
 * @param def - The deferred promise
 * @param timeout - The timeout duration in milliseconds
 * @returns The timeout ID (for cleanup purposes)
 */
export function createWaitingTimeout(
  axios: AxiosCacheInstance,
  id: string,
  def: Deferred<void>,
  timeout: number
): ReturnType<typeof setTimeout> {
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
