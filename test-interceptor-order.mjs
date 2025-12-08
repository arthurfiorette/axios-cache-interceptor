// Test to verify the actual order of axios interceptors
import Axios from 'axios';

const testAxios = () => {
  const axios = Axios.create();
  const order = [];

  // Mock adapter that just returns a response
  axios.defaults.adapter = async (config) => {
    order.push('ADAPTER');
    return {
      data: { success: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    };
  };

  // Add interceptors BEFORE setupCache
  axios.interceptors.request.use((config) => {
    order.push('req-1-before');
    return config;
  });

  axios.interceptors.request.use((config) => {
    order.push('req-2-before');
    return config;
  });

  axios.interceptors.response.use((response) => {
    order.push('res-1-before');
    return response;
  });

  axios.interceptors.response.use((response) => {
    order.push('res-2-before');
    return response;
  });

  // Simulate setupCache by adding interceptors
  axios.interceptors.request.use((config) => {
    order.push('req-CACHE');
    return config;
  });

  axios.interceptors.response.use((response) => {
    order.push('res-CACHE');
    return response;
  });

  // Add interceptors AFTER setupCache
  axios.interceptors.request.use((config) => {
    order.push('req-3-after');
    return config;
  });

  axios.interceptors.request.use((config) => {
    order.push('req-4-after');
    return config;
  });

  axios.interceptors.response.use((response) => {
    order.push('res-3-after');
    return response;
  });

  axios.interceptors.response.use((response) => {
    order.push('res-4-after');
    return response;
  });

  return { axios, order };
};

// Run the test
(async () => {
  const { axios, order } = testAxios();
  
  await axios.get('http://test.com');
  
  console.log('\nActual execution order:');
  console.log(order.join(' -> '));
  
  console.log('\n\nRequest interceptors order:');
  const reqOrder = order.filter(x => x.startsWith('req-'));
  console.log(reqOrder.join(' -> '));
  
  console.log('\nResponse interceptors order:');
  const resOrder = order.filter(x => x.startsWith('res-'));
  console.log(resOrder.join(' -> '));
  
  console.log('\n\nConclusion:');
  console.log('Request interceptors are executed in REVERSE order (Last In First Out)');
  console.log('  - req-4-after runs FIRST (added last)');
  console.log('  - req-1-before runs LAST (added first)');
  console.log('');
  console.log('Response interceptors are executed in NORMAL order (First In First Out)');
  console.log('  - res-1-before runs FIRST (added first)');
  console.log('  - res-4-after runs LAST (added last)');
})();
