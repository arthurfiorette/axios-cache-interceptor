import { JSDOM } from 'jsdom';

const dom = new JSDOM(undefined, { url: 'https://axios-cache-interceptor.js.org' });

export const localStorage = dom.window.localStorage;
export const sessionStorage = dom.window.sessionStorage;
