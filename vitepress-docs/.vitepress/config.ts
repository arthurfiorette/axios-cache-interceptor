import { defineConfig } from 'vitepress';

export default defineConfig({
  // The language of the site. This will be used to set the `lang` attribute on the <html> element
  lang: 'en-US',
  // Title for the site. This will be displayed in the nav bar also used as the suffix for all page titles
  title: 'Axios Cache Interceptor',
  // Description for the site. This will render as a <meta> tag in the page HTML
  description:
    'Small and efficient cache interceptor for axios. Etag, Cache-Contol, TTL, HTTP headers and more!.',

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
      }
    ],

    nav: [
      //! Just for testing nav bar
      { text: 'Guide', link: '/guide' },
      { text: 'API', link: '/api' }
    ],

    //! Temp link for testing, will be changed to the real one before merged to production
    editLink: {
      pattern:
        'https://github.com/cainthebest/axios-cache-interceptor/edit/feat/axios-v1.0.0/vitepress-docs/:path'
    },

    footer: {
      message: 'Made with ❤️',
      copyright: 'Copyright © 2021-present Arthur Fiorette & Contributors'
    }
  }
});
