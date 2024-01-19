import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vitepress';

const read = (relative) =>
  readFileSync(resolve(process.cwd(), 'docs', '.vitepress', relative), 'utf-8');

const isVersion = process.argv.indexOf('--base');
const VERSION = isVersion > -1 ? process.argv[isVersion + 1].slice(1, -1) : 'Latest';
const BASE_URL = isVersion > -1 ? process.argv[isVersion + 1] : '/';

console.log(
  isVersion > -1 ? `Building docs for version ${VERSION}` : 'Building docs for latest version'
);

const description =
  'Small and efficient cache interceptor for axios. Etag, Cache-Control, TTL, HTTP headers and more!';
const url = 'https://axios-cache-interceptor.js.org';

export default defineConfig({
  // The language of the site. This will be used to set the `lang` attribute on the <html> element
  lang: 'en-US',
  // Title for the site. This will be displayed in the nav bar also used as the suffix for all page titles
  title: 'Axios Cache Interceptor',
  // Description for the site. This will render as a <meta> tag in the page HTML
  description: description,

  // The directory where the markdown pages are stored
  srcDir: './src',
  base: BASE_URL,

  //! Experimental
  // Allows removing trailing .html from URLs
  cleanUrls: true,

  // The default theme will be determined by the user's preferred color scheme
  appearance: true,
  // Use git commit to get the timestamp of the last update
  lastUpdated: true,

  // Additional elements to render in the <head> tag in the page HTML
  head: [
    // Attach a custom favicon
    ['link', { rel: 'icon', href: `${BASE_URL}favicon.ico', type: 'image/x-icon` }],
    ['link', { rel: 'apple-touch-icon', sizes: '57x57', href: `${BASE_URL}apple-icon-57x57.png` }],
    ['link', { rel: 'apple-touch-icon', sizes: '60x60', href: `${BASE_URL}apple-icon-60x60.png` }],
    ['link', { rel: 'apple-touch-icon', sizes: '72x72', href: `${BASE_URL}apple-icon-72x72.png` }],
    ['link', { rel: 'apple-touch-icon', sizes: '76x76', href: `${BASE_URL}apple-icon-76x76.png` }],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        sizes: '114x114',
        href: `${BASE_URL}apple-icon-114x114.png`
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        sizes: '120x120',
        href: `${BASE_URL}apple-icon-120x120.png`
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        sizes: '144x144',
        href: `${BASE_URL}apple-icon-144x144.png`
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        sizes: '152x152',
        href: `${BASE_URL}apple-icon-152x152.png`
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: `${BASE_URL}apple-icon-180x180.png`
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        href: `${BASE_URL}android-icon-192x192.png`
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: `${BASE_URL}favicon-32x32.png`
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '96x96',
        href: `${BASE_URL}favicon-96x96.png`
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: `${BASE_URL}favicon-16x16.png`
      }
    ],

    ['link', { rel: 'manifest', href: `${BASE_URL}manifest.json` }],
    ['meta', { name: 'msapplication-TileColor', content: '#e5972a' }],
    ['meta', { name: 'msapplication-TileImage', content: `${BASE_URL}ms-icon-144x144.png` }],
    ['meta', { name: 'theme-color', content: '#e5972a' }],
    ['meta', { name: 'description', content: description }],

    // Facebook Meta Tags
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Axios Cache Interceptor' }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:image', content: `${BASE_URL}preview.png` }],

    // Twitter Meta Tags
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:domain', content: url.replace(/https?:\/\//, '') }],
    ['meta', { property: 'twitter:url', content: url }],
    ['meta', { name: 'twitter:title', content: 'Axios Cache Interceptor' }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: `${BASE_URL}preview.png` }],

    [
      'meta',
      {
        name: 'google-site-verification',
        content: 'u9Nw6WpRrWDhdPTAv-LGIE9aJ0C15t7zkjuaUizDJnA'
      }
    ],

    // Analytics (Plausible) public available at https://plausible.io/axios-cache-interceptor.js.org
    [
      'script',
      {
        defer: '',
        'data-domain': 'axios-cache-interceptor.js.org',
        src: 'https://plausible.io/js/script.js'
      }
    ],

    // Ld+Json
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'http://www.schema.org',
        '@type': 'Organization',
        name: 'Axios Cache Interceptor',
        url: url,
        sameAs: ['https://github.com/ArthurFiorette/axios-cache-interceptor'],
        datePublished: '2022-01-17',
        dateModified: '2022-01-17',
        logo: `${url}/preview.png`,
        image: `${url}/preview.png`,
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
        link: 'https://www.jsdelivr.com/package/npm/axios-cache-interceptor'
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
      { text: 'Config', link: '/config' },
      { text: 'Others', link: '/others/license' },
      {
        text: VERSION,
        items: [
          { text: 'Latest', link: url },
          { text: 'v0.x', link: `${url}/v0/` }
        ].filter((i) => (BASE_URL === '/' ? i.text !== 'Latest' : !i.link.includes(BASE_URL)))
      }
    ],

    //! Temp link for testing, will be changed to the real one before merged to production
    editLink: {
      pattern: 'https://github.com/arthurfiorette/axios-cache-interceptor/edit/main/docs/src/:path'
    },

    footer: {
      message: 'Made with ❤️',
      copyright: 'Copyright (c) 2021-present Arthur Fiorette & Contributors'
    },

    algolia: {
      appId: 'WPY8IFS0UX',
      apiKey: '8cc9e4ff3f98b5854346224aac791bbf',
      indexName: 'axios-cache-interceptor-js'
    },

    carbonAds: {
      // Helping Vue while this website doesn't have enough traffic
      code: 'CEBDT27Y',
      placement: 'vuejsorg'
    },

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Debugging', link: '/guide/debugging' },
          { text: 'Storages', link: '/guide/storages' },
          { text: 'Request Id', link: '/guide/request-id' },
          { text: 'Invalidating Cache', link: '/guide/invalidating-cache' },
          { text: 'Comparison', link: '/guide/comparison' },
          { text: 'Other Interceptors', link: '/guide/interceptors' }
        ]
      },
      {
        text: 'Config',
        items: [
          { text: 'Global Configuration', link: '/config' },
          { text: 'Request Specifics', link: '/config/request-specifics' },
          { text: 'Response Object', link: '/config/response-object' }
        ]
      },
      {
        text: 'Others',
        items: [
          { text: 'MIT License', link: '/others/license' },
          { text: 'Changelog', link: '/others/changelog' }
        ]
      }
    ]
  },

  markdown: {
    lineNumbers: false,
    typographer: true
  }
});
