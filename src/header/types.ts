/**
 * Interpret the cache control header, if present.
 *
 * @param header the header object to interpret.
 *
 * @returns `false` if cache should not be used. `undefined` when provided
 * headers was not enough to determine a valid value. Or a `number` containing
 * the number of **seconds** to cache the response.
 */
export type HeaderInterpreter = (
  headers: Record<string, string> | undefined
) => false | undefined | number;
