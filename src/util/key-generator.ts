import { CacheRequestConfig } from '../axios/types';

export type KeyGenerator = (options: CacheRequestConfig) => string;

export const defaultKeyGenerator: KeyGenerator = ({
  baseURL,
  url,
  method: nullableMethod,
  params,
  id
}) => {
  if (id) {
    return `id::${String(id)}`;
  }

  const method = nullableMethod?.toLowerCase() || 'get';
  const jsonParams = params ? JSON.stringify(params) : '{}';

  return `${method}::${baseURL}::${url}::${jsonParams}`;
};
