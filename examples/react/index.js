/* eslint-disable */

import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';
import { AxiosProvider } from './axios-context';

ReactDOM.render(
  <AxiosProvider>
    <App />
  </AxiosProvider>,
  document.getElementById('root')
);
