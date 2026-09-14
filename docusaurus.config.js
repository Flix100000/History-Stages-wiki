// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'History Stages',
  tagline: 'Documentation for the History Stages modpack framework',
  favicon: 'img/icon.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://flix100000.github.io',
  // For GitHub Pages deployment, this is '/<repo-name>/'
  baseUrl: '/History-Stages-wiki/',

  // GitHub pages deployment config.
  organizationName: 'Flix100000', // GitHub org/user name.
  projectName: 'History-Stages-wiki', // Repo name.

  onBrokenLinks: 'throw', // migration safety net — build fails on any bad internal link
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: 'wiki',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/Flix100000/History-Stages-wiki/edit/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/Flix100000/History-Stages-wiki/edit/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'api',
        path: 'api',
        routeBasePath: 'api',
        sidebarPath: './sidebarsApi.js',
        editUrl: 'https://github.com/Flix100000/History-Stages-wiki/edit/main/',
      }),
    ],
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import('@easyops-cn/docusaurus-search-local').PluginOptions} */
      ({
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: ['/wiki', '/api'],
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'History Stages',
        logo: {
          alt: 'History Stages Logo',
          src: 'img/icon.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'wikiSidebar',
            position: 'left',
            label: 'Wiki',
          },
          {
            type: 'docSidebar',
            sidebarId: 'apiSidebar',
            docsPluginId: 'api',
            position: 'left',
            label: 'API',
          },
          {
            type: 'dropdown',
            label: 'Download',
            position: 'left',
            items: [
              {
                label: 'CurseForge',
                href: 'https://www.curseforge.com/minecraft/mc-mods/history-stages',
              },
              {
                label: 'Modrinth',
                href: 'https://modrinth.com/mod/history-stages',
              },
              {
                label: 'GitHub Releases',
                href: 'https://github.com/Flix100000/History-Stages/releases',
              },
            ],
          },
          {
            href: 'https://discord.gg/BeZzxyZ9c4',
            position: 'right',
            className: 'header-icon-link header-discord-link',
            'aria-label': 'Discord',
          },
          {
            href: 'https://github.com/Flix100000/History-Stages',
            position: 'right',
            className: 'header-icon-link header-github-link',
            'aria-label': 'GitHub',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Wiki',
            items: [
              {
                label: 'Getting Started',
                to: '/wiki/general/getting-started',
              },
              {
                label: 'Addon API',
                to: '/api/addon-development',
              },
            ],
          },
          {
            title: 'Download',
            items: [
              {
                label: 'CurseForge',
                href: 'https://www.curseforge.com/minecraft/mc-mods/history-stages',
              },
              {
                label: 'Modrinth',
                href: 'https://modrinth.com/mod/history-stages',
              },
              {
                label: 'GitHub Releases',
                href: 'https://github.com/Flix100000/History-Stages/releases',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/BeZzxyZ9c4',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/Flix100000/History-Stages',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'License',
                href: 'https://github.com/Flix100000/History-Stages/blob/neoforge-1.21.X/LICENSE.txt',
              },
              {
                label: 'Contributing',
                href: 'https://github.com/Flix100000/History-Stages/blob/neoforge-1.21.X/CONTRIBUTING.md',
              },
              {
                label: 'Security Policy',
                href: 'https://github.com/Flix100000/History-Stages/blob/neoforge-1.21.X/SECURITY.md',
              },
              {
                label: 'Report a Bug',
                href: 'https://github.com/Flix100000/History-Stages/issues',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} History Stages. Built with Docusaurus.<br />
          This is an unofficial, fan-made project. Not affiliated with Mojang Studios or Microsoft.
          Minecraft is a trademark of Mojang Synergies AB.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
