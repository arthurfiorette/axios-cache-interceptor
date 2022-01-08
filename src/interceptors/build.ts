import type {
  AxiosCacheInstance,
  CacheAxiosResponse,
  CacheRequestConfig
} from '../cache/axios';

export interface AxiosInterceptor<T> {
  onFulfilled?(value: T): T | Promise<T>;
  onRejected?(error: any): any;
  apply: (axios: AxiosCacheInstance) => void;
}

export type RequestInterceptor = AxiosInterceptor<CacheRequestConfig<unknown, unknown>>;
export type ResponseInterceptor = AxiosInterceptor<CacheAxiosResponse<unknown, unknown>>;

export function buildInterceptor(
  type: 'request',
  interceptor: Omit<RequestInterceptor, 'apply'>
): RequestInterceptor;

export function buildInterceptor(
  type: 'response',
  interceptor: Omit<ResponseInterceptor, 'apply'>
): ResponseInterceptor;

export function buildInterceptor(
  type: 'request' | 'response',
  { onFulfilled, onRejected }: Omit<AxiosInterceptor<unknown>, 'apply'>
): AxiosInterceptor<unknown> {
  return {
    onFulfilled,
    onRejected,
    apply: (axios) => axios.interceptors[type].use(onFulfilled, onRejected)
  };
}
