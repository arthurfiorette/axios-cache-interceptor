import type { AxiosRequestHeaders, AxiosResponseHeaders } from 'axios';

/**
 * Extracts specified header values from request headers.
 * Generic utility for extracting a subset of headers.
 *
 * @param requestHeaders The full request headers object
 * @param headerNames Array of header names to extract
 * @returns Object with extracted header values
 */
export function extractHeaders(
  requestHeaders: AxiosRequestHeaders | AxiosResponseHeaders,
  headerNames: string[]
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (const name of headerNames) {
    result[name] = requestHeaders.get(name)?.toString();
  }

  return result;
}
