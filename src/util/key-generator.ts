import { CacheRequestConfig } from '../axios/types';

export function defaultKeyGenerator({
  baseURL,
  url,
  method,
  params,
  id
}: CacheRequestConfig): string {
  return id
    ? `id::${String(id)}`
    : `${method?.toLowerCase() || 'get'}::${baseURL}::${url}::${JSON.stringify(params || '{}')}`;
}
