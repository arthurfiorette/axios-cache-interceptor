import type { KeyGenerator } from './types';

// Remove first and last '/' char, if present
const SLASHES_REGEX = /^\/|\/$/g;

export const defaultKeyGenerator: KeyGenerator = ({
  baseURL = '',
  url = '',
  method,
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
    method?.toLowerCase() || 'get'
  }::${
    // complete url
    baseURL + (baseURL && url ? '/' : '') + url
  }::${
    //params
    params ? JSON.stringify(params, Object.keys(params).sort()) : '{}'
  }`;
};
