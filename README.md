<img src=".github/logo.svg" alt="" width="72" height="72">

# Osnova Frontend

[![CI](https://github.com/osnova-kit/osnova_frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/osnova-kit/osnova_frontend/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**The web interface of [Osnova](https://github.com/osnova-kit/osnova_backend)**, a modular
full-stack template for web applications on FastAPI and React. It talks to the
`osnova_backend` API only over REST and builds its routes and UI from what the backend
says is switched on.

<p>
  <img src="https://github.com/osnova-kit/osnova_backend/raw/main/.github/screenshots/home-dark.webp" alt="The home page, dark theme" width="49%">
  <img src="https://github.com/osnova-kit/osnova_backend/raw/main/.github/screenshots/admin-overview.webp" alt="Admin: overview" width="49%">
</p>

## What you get

- **A shell for every page:** header, collapsible side menu (or a top menu), mobile menu,
  footer, breadcrumbs, shared loading / empty / error / forbidden states, 404 and error pages.
- **Modules by capability:** sign-in and the profile, the admin, My files, the notification
  bell; a module that is off adds no routes and its code is never downloaded;
  `npm run strip` deletes the unused ones.
- **The admin:** overview, users, leads, roles with permissions, groups, the audit log,
  settings generated from the backend, delivery channels.
- **Languages and SEO:** English and Russian, the language in the URL, prerendered
  `<head>` for link previews, `hreflang`, sitemap.
- **Building blocks:** forms rendered from their backend description, tables with search,
  filters and sorting kept in the URL, landing blocks, optimised images, locale-aware
  formatting, light and dark themes from one brand file.
- **Production:** security headers from nginx, optional analytics behind a cookie banner,
  optional Sentry in its own chunk, legal page templates.
- **Quality:** Biome, TypeScript, Vitest, Playwright end-to-end tests against the Docker
  stack, Dependabot.

Stack: React 19, TypeScript, Vite, Ant Design, Zustand, React Router, Axios, react-i18next.

## Quick start

The whole stack (both repositories side by side) starts from
[osnova_backend](https://github.com/osnova-kit/osnova_backend#quick-start). For the
interface alone, with the backend running on `http://localhost:8000` and Node.js 24:

```bash
npm install
npm run dev        # http://localhost:5173
```

## Documentation

[DOCUMENTATION.md](DOCUMENTATION.md): layout and modules, the shell and navigation, areas
and the admin, languages and SEO, forms, theme, tables, the API client, legal pages,
analytics and error tracking, Docker, tests, upgrading. The whole stack:
[osnova_backend/DOCUMENTATION.md](https://github.com/osnova-kit/osnova_backend/blob/main/DOCUMENTATION.md).

## Contributing and license

Changes: [CHANGELOG.md](CHANGELOG.md). Contributing: [CONTRIBUTING.md](CONTRIBUTING.md);
security: [SECURITY.md](SECURITY.md). License: [MIT](LICENSE).
