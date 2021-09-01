import { AxiosCacheInstance } from '../axios/types';

export function applyRequestInterceptor(axios: AxiosCacheInstance) {
  axios.interceptors.request.use(async (config) => {
    return config;
  });
}
