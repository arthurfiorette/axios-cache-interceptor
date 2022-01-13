import type { KeyGenerator } from './types';

// Remove first and last '/' char, if present
const SLASHES_REGEX = /^\/|\/$/g;

export const defaultKeyGenerator: KeyGenerator = ({
  baseURL = '',
  url = '',
  method = 'get',
  params,
  id
}) => {
  if (id) {
    return id;
  }

  // Remove trailing slashes
  baseURL = baseURL.replace(SLASHES_REGEX, '');
  url = url.replace(SLASHES_REGEX, '');

  return `${
    // method
    method.toLowerCase()
  }::${
    // complete url
    baseURL + (baseURL && url ? '/' : '') + url
  }::${
    // params
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    params ? JSON.stringify(params, Object.keys(params).sort()) : '{}'
  }`;
};
