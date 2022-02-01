/* eslint-disable */

/*
 * Replace ../../src with axios-cache-interceptor
 */

import Axios from 'axios';
import { createContext, useContext, useState } from 'react';
import { setupCache } from '../../src'; // axios-cache-interceptor

/** @type {import('react').Context<import('../../src').AxiosCacheInstance>} */
const AxiosContext = createContext(null);

export const useAxios = () => useContext(AxiosContext);

export const AxiosProvider = ({ children }) => {
  const [axios] = useState(
    setupCache(
      // Custom instance to prevent conflict with other pieces of code
      Axios.create(),
      // cache config
      {}
    )
  );

  return <AxiosContext.Provider value={axios}>{children}</AxiosContext.Provider>;
};
