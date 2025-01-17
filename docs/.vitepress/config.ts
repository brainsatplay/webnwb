import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "WebNWB",
  description: "Neurodata without Borders on the Web",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Installation', link: '/installation/index'},
      { text: 'Examples', link: '/examples/index' }
    ],

    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
        ]
      },
      {
        text: 'Installation',
        link: '/installation/index',
        items: [
          { text: 'CDN', link: '/installation/cdn' },
          { text: 'NPM', link: '/installation/npm' }
        ]
      },
      {
        text: 'Examples',
        link: '/examples/index',
        items: [
          { text: 'Read', link: '/examples/read' },
          { text: 'Write', link: '/examples/write' },
          { text: 'Create', link: '/examples/create' }
        ]
      },
      {
        text: 'EasyNWB',
        items: [
          { text: 'Overview', link: '/easynwb/overview' }
        ]
      },
      {
        text: 'Development',
        items: [
          { text: 'Overview', link: '/development/overview' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/brainsatplay/webnwb' }
    ],

    footer: {
      message: "Released under the GNU Affero General Public License.",
      copyright: `Copyright © 2022-${new Date().getFullYear()} Brains@Play`,
    },
  }
})
