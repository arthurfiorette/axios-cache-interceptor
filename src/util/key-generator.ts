import type { KeyGenerator } from './types';

// Remove first and last '/' char, if present
const SLASHES_REGEX = /^\/|\/$/g;

const stringifyObject = (obj?: unknown) =>
  obj !== undefined
    ? JSON.stringify(obj, obj === null ? undefined : Object.keys(obj as object).sort())
    : '{}';

export const defaultKeyGenerator: KeyGenerator = ({
  baseURL = '',
  url = '',
  method = 'get',
  params,
  data,
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
    // query
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    stringifyObject(params)
  }::${
    // request body
    stringifyObject(data)
  }`;
};
