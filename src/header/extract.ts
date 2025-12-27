/**
 * Extracts specified header values from request headers.
 * Generic utility for extracting a subset of headers.
 *
 * @param requestHeaders The full request headers object
 * @param headerNames Array of header names to extract
 * @returns Object with extracted header values
 */
export function extractHeaders(
  requestHeaders: Record<string, any>,
  headerNames: string[]
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const name of headerNames) {
    result[name] = String(requestHeaders[name.toLowerCase()] || '');
  }

  return result;
}
