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
    ['link', { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' }],
    ['link', { rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-icon-57x57.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '60x60', href: '/apple-icon-60x60.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '72x72', href: '/apple-icon-72x72.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '76x76', href: '/apple-icon-76x76.png' }],
    [
      'link',
      { rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-icon-114x114.png' }
    ],
    [
      'link',
      { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-icon-120x120.png' }
    ],
    [
      'link',
      { rel: 'apple-touch-icon', sizes: '144x144', href: '/apple-icon-144x144.png' }
    ],
    [
      'link',
      { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-icon-152x152.png' }
    ],
    [
      'link',
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-icon-180x180.png' }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        href: '/android-icon-192x192.png'
      }
    ],
    [
      'link',
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }
    ],
    [
      'link',
      { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' }
    ],
    [
      'link',
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }
    ],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'msapplication-TileColor', content: '#e5972a' }],
    ['meta', { name: 'msapplication-TileImage', content: '/ms-icon-144x144.png' }],
    ['meta', { name: 'theme-color', content: '#e5972a' }],

    // OG
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://axios-cache-interceptor.js.org' }],
    ['meta', { property: 'og:title', content: 'Axios Cache Interceptor' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'Small and efficient cache interceptor for axios.'
      }
    ],
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://axios-cache-interceptor.js.org/preview.png'
      }
    ],

    // Analytics :(
    // This is an open source documentation project, analytics is being used to only track the number of visitors.
    // I won't get mad if you disable it.
    [
      'meta',
      {
        name: 'google-site-verification',
        content: 'u9Nw6WpRrWDhdPTAv-LGIE9aJ0C15t7zkjuaUizDJnA'
      }
    ],
    [
      'script',
      { async: 'true', src: 'https://www.googletagmanager.com/gtag/js?id=G-K548ZF395X' }
    ],
    [
      'script',
      {},
      `function gtag() { dataLayer.push(arguments); }; (window.dataLayer = window.dataLayer || []); gtag('js', new Date()); gtag('config', 'G-K548ZF395X');`
    ],

    // Ld+Json
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'http://www.schema.org',
        '@type': 'Organization',
        name: 'Axios Cache Interceptor',
        url: 'https://axios-cache-interceptor.js.org/',
        sameAs: ['https://github.com/ArthurFiorette/axios-cache-interceptor'],
        datePublished: '2022-01-17',
        dateModified: '2022-01-17',
        logo: 'https://axios-cache-interceptor.js.org/preview.png',
        image: 'https://axios-cache-interceptor.js.org/preview.png',
        description:
          'Axios Cache Interceptor is a small and efficient cache interceptor for axios.',
        headline: 'A small and efficient cache interceptor for axios.'
      })
    ]
  ],

  // `themeConfig` has JSDoc definitions for all the options
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/arthurfiorette/axios-cache-interceptor'
      },
      {
        icon: { svg: read('../src/public/npm.svg') },
        link: 'https://npmjs.com/package/axios-cache-interceptor'
      },
      {
        icon: { svg: read('../src/public/jsdelivr.svg') },
        link: 'https://www.jsdelivr.com/package/npm/axios-token-interceptor'
      },
      {
        icon: { svg: read('../src/public/bundlephobia.svg') },
        link: 'https://bundlephobia.com/package/axios-cache-interceptor'
      },
      {
        icon: { svg: read('../src/public/packagephobia.svg') },
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
    // algolia: {
    //   appId: '8J64VVRP8K',
    //   apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
    //   indexName: 'vitepress'
    // },

    // TODO: Change this to the real one
    // carbonAds: {
    //   code: 'CEBDT27Y',
    //   placement: 'vuejsorg'
    // },

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
