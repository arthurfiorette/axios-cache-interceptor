const { description } = require('../../package');
const { defineConfig } = require('vuepress/config');

module.exports = defineConfig({
  /** Ref：https://v1.vuepress.vuejs.org/config/#title */
  title: 'Axios Cache Interceptor',
  /** Ref：https://v1.vuepress.vuejs.org/config/#description */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * Ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#008AE6' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * Ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: 'arthurfiorette/axios-cache-interceptor',
    editLinks: true,
    docsDir: 'docs',
    lastUpdated: true,
    logo: '/main-icon.png',
    smoothScroll: true,
    nav: [
      {
        text: 'Guide',
        link: '/guide/'
      },
      {
        text: 'Config',
        link: '/config/'
      }
    ],
    sidebar: {
      '/guide/': [
        {
          title: 'Guide',
          collapsable: false,
          children: [
            '/guide/',
            '/guide/getting-started',
            '/guide/debugging',
            '/guide/storages',
            '/guide/request-id',
            '/guide/invalidating-cache',
            '/guide/comparison'
          ]
        }
      ],
      '/config/': [
        {
          title: 'Config reference',
          collapsable: false,
          children: [
            '/config/',
            '/config/per-request-configuration',
            '/config/response-object'
          ]
        }
      ]
    }
  },

  /** Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/ */
  plugins: [
    //
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    ['@vuepress/plugin-google-analytics', { ga: 'G-K548ZF395X' }]
  ]
});
