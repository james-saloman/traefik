// @ts-check

const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Traefik Mastery',
  tagline: 'A comprehensive learning resource for mastering Traefik reverse proxy and networking fundamentals',
  favicon: 'img/favicon.ico',
  url: 'http://localhost:3000',
  baseUrl: '/docs/',
  organizationName: 'traefik-learning',
  projectName: 'traefik-mastery',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/yourusername/traefik-mastery/tree/main/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/traefik-social-card.jpg',
    navbar: {
      title: 'Traefik Mastery',
      logo: {
        alt: 'Traefik Logo',
        src: 'img/traefik-logo.png',
      },
      items: [
        {
          type: 'html',
          position: 'left',
          value: '<a class="navbar__item navbar__link" href="/">← App Home</a>',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/yourusername/traefik-mastery',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/intro',
            },
            {
              label: 'Networking Fundamentals',
              to: '/networking-fundamentals/what-is-http',
            },
            {
              label: 'Traefik Core',
              to: '/traefik-core/traefik-overview',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Hands-on Labs',
              to: '/hands-on-labs/basic-routing',
            },
            {
              label: 'Debugging Guide',
              to: '/debugging/access-logs',
            },
            {
              label: 'Cheatsheets',
              to: '/cheatsheets/docker-commands',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              html: '<a class="footer__link-item" href="/">← Back to App Home</a>',
            },
            {
              label: 'Official Traefik Docs',
              href: 'https://doc.traefik.io',
            },
            {
              label: 'GitHub Issues',
              href: 'https://github.com/traefik/traefik/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Traefik Mastery. Built with Docusaurus.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ['bash', 'yaml', 'toml', 'docker'],
    },
  },
};

module.exports = config;
