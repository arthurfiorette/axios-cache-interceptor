/* eslint-disable */

import React, { useState } from 'react';
import { useAxios } from './axios-context';

export const App = () => {
  // You can use react context, as exemplified here
  // but you can also just export the AxiosCacheInstance
  // from a file and use it directly. Happy coding :)
  const axios = useAxios();

  const [{ data, error, loading }, setResponse] = useState({
    data: [],
    loading: true,
    error: null
  });

  axios.get('https://jsonplaceholder.typicode.com/users').then(
    ({ data }) => setResponse({ data, loading: false, error: null }),
    (error) => setResponse({ data: [], loading: false, error })
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div>{data}</div>
    </div>
  );
};
