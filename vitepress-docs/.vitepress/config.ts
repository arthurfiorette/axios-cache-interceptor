import fs from 'fs';
import { defineConfig } from 'vitepress';

const read = (relative) => fs.readFileSync(require.resolve(relative), 'utf-8');

export default defineConfig({
  // The language of the site. This will be used to set the `lang` attribute on the <html> element
  lang: 'en-US',
  // Title for the site. This will be displayed in the nav bar also used as the suffix for all page titles
  title: 'Axios Cache Interceptor',
  // Description for the site. This will render as a <meta> tag in the page HTML
  description:
    'Small and efficient cache interceptor for axios. Etag, Cache-Control, TTL, HTTP headers and more!.',

  // The directory where the markdown pages are stored
  srcDir: './src',

  //! Experimental
  // Allows removing trailing .html from URLs
  cleanUrls: 'without-subfolders',

  // The default theme will be determined by the user's preferred color scheme
  appearance: true,
  // Use git commit to get the timestamp of the last update
  lastUpdated: true,

  // Additional elements to render in the <head> tag in the page HTML
  head: [
    // Attach a custom favicon
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  // `themeConfig` has JSDoc definitions for all the options
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/arthurfiorette/axios-cache-interceptor'
      },
      {
        icon: { svg: read('../public/npm.svg') },
        link: 'https://npmjs.com/package/axios-cache-interceptor'
      },
      {
        icon: { svg: read('../public/jsdelivr.svg') },
        link: 'https://www.jsdelivr.com/package/npm/axios-token-interceptor'
      },
      {
        icon: { svg: read('../public/bundlephobia.svg') },
        link: 'https://bundlephobia.com/package/axios-cache-interceptor'
      },
      {
        icon: { svg: read('../public/packagephobia.svg') },
        link: 'https://packagephobia.com/result?p=axios-cache-interceptor'
      }
    ],

    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'Config', link: '/config' }
    ],

    //! Temp link for testing, will be changed to the real one before merged to production
    editLink: {
      pattern:
        // TODO: Check if this is the correct link when released.
        'https://github.com/arthurfiorette/axios-cache-interceptor/edit/main/docs/:path'
    },

    footer: {
      message: 'Made with ❤️',
      copyright: 'Copyright © 2021-present Arthur Fiorette & Contributors'
    },

    // TODO: Change this to the real one
    algolia: {
      appId: '8J64VVRP8K',
      apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
      indexName: 'vitepress'
    },

    // TODO: Change this to the real one
    carbonAds: {
      code: 'CEBDT27Y',
      placement: 'vuejsorg'
    },

    sidebar: {
      '/guide': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Debugging', link: '/guide/debugging' },
            { text: 'Storages', link: '/guide/storages' },
            { text: 'Request Id', link: '/guide/request-id' },
            { text: 'Invalidating Cache', link: '/guide/invalidating-cache' },
            { text: 'Comparison', link: '/guide/comparison' }
          ]
        }
      ],
      '/config': [
        {
          text: 'Config',
          items: [
            { text: 'Global Configuration', link: '/config' },
            { text: 'Request Specifics', link: '/config/request-specifics' },
            { text: 'Response Object', link: '/config/response-object' }
          ]
        }
      ]
    }
  }
});
