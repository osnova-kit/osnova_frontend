# Changelog

All notable changes are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-11-18

The first public release.

### Added
- An interface built from the backend's `/bootstrap`: routes and menus follow the enabled modules.
- Sign-in, sign-up, password reset, Google and a profile page.
- Admin: overview, users, leads, roles, groups, audit log, settings and delivery channels.
- Forms rendered from their backend description, tables with search, filters and sorting in the
  URL, landing blocks and responsive images.
- English and Russian with the language in the URL, light and dark themes, prerendered SEO tags.
- Docker image with nginx, security headers, compression and caching, optional Sentry.
- `npm run strip` to remove the unused modules and `npm run upgrade` to take new releases.

[Unreleased]: https://github.com/osnova-kit/osnova_frontend/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/osnova-kit/osnova_frontend/releases/tag/v1.0.0
