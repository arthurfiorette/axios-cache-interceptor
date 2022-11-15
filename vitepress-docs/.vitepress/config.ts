import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  title: 'Axios Cache Interceptor',
  description:
    'Small and efficient cache interceptor for axios. Etag, Cache-Contol, TTL, HTTP headers and more!.',

  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/arthurfiorette/axios-cache-interceptor'
      }
    ],

    // Temp link for testing, will be changed to the real one before merged to production
    editLink: {
      pattern:
        'https://github.com/cainthebest/axios-cache-interceptor/edit/feat/axios-v1.0.0/vitepress-docs/:path'
    },

    footer: {
      message: 'Made with ❤️',
      copyright: 'Copyright © 2021-present Arthur Fiorette & Contributors'
    },

    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'API', link: '/api' }
    ]
  }
});
