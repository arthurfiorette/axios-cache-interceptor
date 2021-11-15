import type { AxiosResponse } from 'axios';

export const EMPTY_RESPONSE = {
  headers: {},
  status: 200,
  statusText: '200 OK',
  data: true
};

export const createResponse = <R>(
  config: Partial<AxiosResponse<R>>
): AxiosResponse<R> => {
  return { ...EMPTY_RESPONSE, config: {}, data: {} as R, request: {}, ...config };
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));
