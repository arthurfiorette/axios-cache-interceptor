import { CacheRequestConfig } from '../axios/types';

// Remove first and last '/' char, if present
// https://regex101.com/r/ENqrFy/1
const SLASHES_REGEX = /^\/|\/+$/g;

export type KeyGenerator = (options: CacheRequestConfig) => string;

export const defaultKeyGenerator: KeyGenerator = ({
  baseURL = '',
  url = '',
  method: nullableMethod,
  params,
  id
}) => {
  if (id) {
    return `id::${String(id)}`;
  }

  // Remove trailing slashes
  baseURL = baseURL.replace(SLASHES_REGEX, '');
  url = url.replace(SLASHES_REGEX, '');

  const method = nullableMethod?.toLowerCase() || 'get';
  const jsonParams = params ? JSON.stringify(params, Object.keys(params).sort()) : '{}';

  return `${method}::${baseURL + '/' + url}::${jsonParams}`;
};
