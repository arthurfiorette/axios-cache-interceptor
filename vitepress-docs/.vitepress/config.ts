import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  title: 'Axios Cache Interceptor',
  description:
    'Small and efficient cache interceptor for axios. Etag, Cache-Contol, TTL, HTTP headers and more!.',

  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/arthurfiorette/axios-cache-interceptor'
      }
    ],

    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2021-present Arthur Fiorette & Contributors'
    },

    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'API', link: '/api' }
    ]
  }
});
