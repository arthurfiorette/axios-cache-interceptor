import { AxiosCacheInstance } from '../axios/types';

export function applyResponseInterceptor(axios: AxiosCacheInstance) {
  axios.interceptors.response.use(async (config) => {
    return config;
  });
}
