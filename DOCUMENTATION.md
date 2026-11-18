# Osnova frontend documentation

The developer guide of the Osnova interface: how the shell is built, how to add pages and
use the shared components, translations, forms and tables. The architecture, profiles,
configuration and deployment of the whole stack are in
[osnova_backend/DOCUMENTATION.md](https://github.com/osnova-kit/osnova_backend/blob/main/DOCUMENTATION.md).

## Contents

1. [Getting started](#1-getting-started)
2. [Layout and modules](#2-layout-and-modules)
3. [Shell and navigation](#3-shell-and-navigation)
4. [Areas, sign-in and the admin](#4-areas-sign-in-and-the-admin)
5. [Languages and SEO](#5-languages-and-seo)
6. [Forms](#6-forms)
7. [Look and data](#7-look-and-data)
8. [Backend API](#8-backend-api)
9. [Legal, analytics and error tracking](#9-legal-analytics-and-error-tracking)
10. [Docker and security headers](#10-docker-and-security-headers)
11. [Tests and tooling](#11-tests-and-tooling)
12. [Upgrading](#12-upgrading)
13. [Common tasks](#13-common-tasks)

---

## 1. Getting started

Requirements: Node.js 24 (`.nvmrc`); the backend from
[osnova_backend](https://github.com/osnova-kit/osnova_backend) running on
`http://localhost:8000`.

```bash
npm install
cp .env.example .env.local   # optional: every value has a default
npm run dev                  # http://localhost:5173
```

Or start both from the backend folder with `make dev-all` (expects this repository at
`../osnova_frontend`). The whole stack in Docker: `make up-standard` in osnova_backend.

Only `.env.example` is committed; local values go to `.env.local` (ignored by git). Every
`VITE_*` value ends up in the public JavaScript bundle, so frontend env files never hold
secrets.

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type check, production build and prerender |
| `npm run preview` | Serve the production build locally |
| `npm run lint` / `npm run format` | Biome: check / fix formatting, lint and import order |
| `npm run typecheck` | TypeScript check (`tsc -b`) |
| `npm test` | Unit tests (Vitest); `npm run test:watch` reruns on changes |
| `npm run e2e` | End-to-end tests (Playwright) against a running stack |
| `npm run generate:client` | API types from `../osnova_backend/openapi.json` |
| `npm run images` | Image variants from `src/assets/images/source` |
| `npm run strip` | Remove the modules a project does not use |
| `npm run upgrade -- v1.1.0` | Merge a new release of the template |

---

## 2. Layout and modules

```
src/
├── api/           # Axios client, bootstrap, forms, errors, generated API types
├── components/    # shell and building blocks: Layout, PageContainer, PageState, Seo,
│                  # SchemaForm, DataTable, Image, landing blocks, CookieBanner...
├── config/        # navigation, brand, format, legal, analytics, prerender pages
├── consent/       # cookie consent state
├── errorTracking/ # optional Sentry (VITE_SENTRY_DSN), its own chunk
├── examples/      # example pages, safe to delete
├── i18n/          # i18next setup, language in the URL, formatting
├── locales/       # translations: <language>/<namespace>.json
├── modules/       # optional modules, one folder each
│   ├── auth/      # sign-in, sign-up, profile, ProtectedRoute   ← authentication
│   ├── admin/     # the /admin area                            ← admin
│   ├── files/     # My files: upload, list, download, delete    ← files
│   ├── notifications/ # the bell in the header                ← notifications
│   └── off.ts     # what the core gets from a module removed with npm run strip
├── pages/         # core pages: Home, legal pages, 404, error
├── routes/        # router built from capabilities, lazyElement()
├── seo/           # SEO tags shared by the app and the prerender script
├── store/         # Zustand stores (bootstrap)
└── utils/
```

**The backend is the source of truth.** Routes and UI are built from
`GET /api/v1/bootstrap`: a capability that is off adds no routes, and its lazy pages are
never downloaded.

**Module = folder.** A module exports its routes from `modules/<name>/index.tsx`; pages are
loaded with `lazyElement()` (`src/routes/lazy.tsx`) into separate chunks, so a page that is
disabled or never opened is never downloaded.

### Removing the modules a project does not use

`npm run strip` reads the flags of `../osnova_backend/.env` (or name them:
`npm run strip -- files notifications`) and lists what goes; `npm run strip -- --apply`
removes it (asks first; only on a clean git working tree, so
`git checkout . && git clean -fd` undoes it). A module goes with the modules that need it
(`auth` takes admin, files and notifications). It deletes `src/modules/<name>` and its
end-to-end tests (`e2e/<name>.*`), points the core's imports of it at `src/modules/off.ts`
(the same names with the values of a module that is off, as when its capability is off in
`/bootstrap`, so the core and the header stay as they are) and removes the CI blocks
between `strip:begin` and `strip:end`. Run `make strip` in the backend too.

The rule that keeps this working: the core imports a module only from its index
(`modules/<name>`), only values, and only names that `src/modules/off.ts` has
(`src/modules/off.test.ts` checks it). When the core starts using a new value of a module,
add the same name to `off.ts` (its value when the module is off) and to the module's
`off.check.ts`, which makes `npm run typecheck` fail when the two stop fitting. CI strips a
copy for each module and runs the lint, type check, tests and build.

### Examples

`src/examples/` holds pages that show the building blocks in use: `/examples` (index),
`/examples/data` (formatting and tables), `/examples/landing` (landing blocks),
`/examples/contact` (a form). To remove them: delete the folder, `exampleRoutes` in
`src/routes/routes.tsx`, the Examples item in `src/config/navigation.ts` and their entries
in `src/config/prerender.json`.

---

## 3. Shell and navigation

### The shell

`src/components/LayoutComponent/LayoutComponent.tsx`:

- **Header:** the site name on the left (and the menu button on phones); language, theme,
  the bell and the user menu on the right.
- **Side menu** (default): open on desktop; the button at its bottom collapses it to icons,
  and the choice is kept in `localStorage`. Below the `md` breakpoint it opens as a drawer.
- **Footer:** © year, site name, contacts from Admin → Settings → Site and links to the
  legal pages.
- **Content:** pages render inside the shell through `<Outlet />`.

### Navigation

`src/config/navigation.ts`:

```ts
export const navigationConfig: NavigationConfig = {
  enabled: true,               // show the menu at all
  position: 'left',            // 'left' | 'right' | 'top'
  showBrand: true,
  showBreadcrumbs: true,
  items: [
    { path: '/', label: 'pages.home', icon: HomeOutlined },
    { path: '/files', label: 'pages.files', icon: FolderOutlined, capability: 'files', requiresAuth: true, area: 'user' },
  ],
};

export const redirects = [{ from: '/home', to: '/' }];
```

- **Menu item:** `path`, `label` (a key in the `common` translations), optional `icon`,
  `capability` (hidden when it is off), `requiresAuth` and `area` (only for signed-in users
  / users who have this area), `permission` (only with this permission, e.g.
  `'leads.read'`).
- **Submenu:** `children: NavItem[]`; the group's own `path` is only a key. It opens on its
  current page and is hidden when no child is visible.
- Pages are not tied to the menu: remove an item and the page is still reachable by URL.
- **Breadcrumb titles:** `routeTitles` in the same file (path → translation key).

### PageContainer: one frame for every page

```tsx
<PageContainer
  title="Orders"
  subtitle="Everything ordered this month"
  actions={<Button type="primary">New order</Button>}
  loading={isLoading}
  error={hasError}
  forbidden={accessDenied}
  empty={items.length === 0}
  emptyText="No orders yet"
>
  ...
</PageContainer>
```

A string `title` also becomes the browser title; `seo` takes an SEO key instead
([SEO](#seo-and-link-previews)); `breadcrumbs` are computed from `routeTitles` when omitted;
`maxWidth` limits the content. States, by priority: `loading` (a spinner), `error` (500 with
**Try again**), `forbidden` (403), `empty`. Unknown paths show the 404 page
(`src/pages/NotFound`); a crashed UI shows `src/pages/Error` through the error boundary,
route errors go to `src/routes/RouteError.tsx`.

### Add a page

1. Create `src/pages/MyPage/MyPage.tsx` and wrap the content in `PageContainer`.
2. Add a route in `src/routes/routes.tsx` (inside the layout children for the shell); for
   signed-in users wrap it in `<ProtectedRoute area="user">`; an admin page goes to
   `src/modules/admin` instead.
3. Add its title key to `routeTitles` and, for a menu link, an item to
   `navigationConfig.items`.
4. For a public page with a link preview, add it to `src/config/prerender.json`.
5. Check it with `npm run dev`, then `npm run lint`, `npm test` and `npm run build`.

---

## 4. Areas, sign-in and the admin

With `authentication` on, the app has three areas in the same shell:

| Area | Pages | Who |
|---|---|---|
| public | home, examples, legal, sign-in | everyone |
| user | `/profile`, `/files`, the project's own pages (starts on home) | any signed-in user |
| admin | `/admin/*` (`src/modules/admin`) | the `admin.access` permission |

- **The backend decides:** `GET /auth/users/me` returns `areas`, e.g. `["admin", "user"]`,
  and `permissions`. After sign-in the user lands on the first area (`landingPath`,
  `src/modules/auth/areas.ts`).
- **Guards:** `<ProtectedRoute area="user">`, `area="admin"` or `permission="leads.read"`:
  guests go to `/login`, users without the area or the permission to their own start page.
- **Permissions in the UI:** `can(user, 'leads.export')` or `useCan('leads.export')`
  (`src/modules/auth/permissions.ts`) show only the actions the backend will allow; the
  admin helpers in `src/modules/admin/access.ts` mirror its rules for roles and groups.
- **Switching areas:** the user menu has **Admin area** / **User area** only for users the
  backend gives both.
- **Sign-in with Google** (and other providers): the sign-in and sign-up pages show a button
  for every provider in `/bootstrap` `auth_providers`. The provider returns to
  `/oauth/<provider>/callback`, which finishes the sign-in on the backend.
- **Email links:** the backend sends links to `/verify-email?token=` and
  `/reset-password?token=` (from **Forgot password?**, `/forgot-password`). Until the email
  is confirmed, the profile shows a notice with **Send again**.
- **Profile** (`/profile`, the same for every role): name, language, password, email, sign
  out everywhere, delete the account; each change asks for the current password. The
  language is the account's: emails and notifications come in it, and switching the
  language in the header saves it too (`src/modules/auth/language.ts`).

### The admin area

The admin has its own menu: `adminNavItems` in `src/modules/admin/navigation.ts`. A new
section is an item there (with the `permission` its route asks for) and a route in
`adminRoute.children` (`src/modules/admin/index.tsx`).

- **Overview:** how the installation is set up (profile, versions, sign-in, captcha, mail,
  rate limits, files, sessions, error tracking, logs, modules, health), counters of users
  and leads with a chart, delivery channels.
- **Users:** a server-side table with search, role / status / group filters, CSV export;
  block, role and groups where the backend allows it
  (`src/modules/admin/pages/Users/permissions.ts`).
- **Leads:** form submissions with search, filters, a modal with the answers under their
  translated labels and the delivery result per channel, status, delete, CSV.
- **Access → Roles, Groups, Audit log:** permissions by area with checkboxes (only those the
  editor has), groups of roles, the log of admin actions with filters and a period.
- **Settings:** one page per settings group of the backend, `/admin/settings/<group>`, each
  an item of the Settings menu. The form is generated from `GET /admin/settings`, so a new
  setting of a group appears without frontend code; a new group needs its menu item and a
  title in `pages` (`common.json`). The page is read-only without the group's permission;
  the mail and protection items are shown only with it. After a save the app re-reads
  `/bootstrap`, so the site name, contacts and languages change at once.
- **Settings → Channels:** lead delivery channels (email, Telegram, webhook), configurable
  entities of the group `lead_channels`. The form is generated from the type description
  (`SchemaFields` with `namePrefix="params"`); secrets come as `********` and are kept when
  sent back; each channel can be tested.

### Files and notifications

- **My files** (`/files`, `files` capability): drag-and-drop upload with progress, the
  user's files in a server-side table with search, download links, delete. Limits come from
  Admin → Settings → Files and their errors are shown per file.
- **Notifications** (`notifications` capability): the bell in the header with the unread
  count (asked every minute while the page is visible), the latest notifications in the
  user's language; a click opens the link and marks it read. The bell is lazy-loaded.

---

## 5. Languages and SEO

### Translations

- react-i18next, set up in `src/i18n/index.ts`. Files:
  `src/locales/<language>/<namespace>.json`. Namespaces: `common` (shell, states, errors),
  `home`, `seo`, `forms`, `legal`, `examples` and one per module.
- English is the source language: add every key to `en` first. Keys are type-checked
  against the English files, so a typo fails the build.
- Only English `common` is in the main bundle; other files are chunks loaded when a page
  uses their namespace.
- Enabled languages and the default come from `/bootstrap`.

```tsx
const { t } = useTranslation('auth');
<h2>{t('login.title')}</h2>
```

**Add a language:** enable it on the backend, copy `src/locales/en` to
`src/locales/<code>` and translate, add its Ant Design locale to `src/i18n/antdLocale.ts`
and its Open Graph locale to `src/seo/head.js`.

### Language in the URL

- Every page lives under a prefix: `/en/...`, `/ru/...`. The prefix is the router
  `basename`, so routes, `<Link to="/login">` and `navigate('/profile')` stay
  language-free.
- A URL without a prefix is redirected to the saved choice, then the browser language, then
  the backend default.
- `LanguageSwitcher` keeps the current page, remembers the choice and is hidden when only
  one language is enabled. Outside the router use `localizedPath('/path')`
  (`src/i18n/language.ts`).

### SEO and link previews

- `<Seo page="home" />` sets title, description, canonical, `hreflang` (+ `x-default`),
  Open Graph and Twitter tags; texts in `src/locales/<language>/seo.json`; other props:
  `title`, `description`, `image`, `noindex` (sign-in, account, admin, errors).
- **Prerender:** `npm run build` runs `scripts/prerender.mjs`. For each page in
  `src/config/prerender.json` and each language it writes
  `dist/<language>/<path>/index.html` with these tags already in `<head>`, so messengers
  and social networks show a preview without running JavaScript. It also writes
  `robots.txt` and, with `VITE_SITE_URL`, `sitemap.xml`.
- **Add a public page:** add it to `prerender.json` (`path`, `seo` key), the key to every
  `seo.json` and to `SeoPage` in `src/components/Seo/Seo.tsx`.

| Build variable | Purpose |
|---|---|
| `VITE_SITE_URL` | Public origin for canonical, `hreflang`, `og:url`, sitemap; without it these are skipped |
| `VITE_OG_IMAGE` | Default preview image (absolute URL or `/path` in `public/`) |
| `PRERENDER_API_URL` | Backend API to read languages from at build time (default: `VITE_BASE_URL` if absolute) |
| `VITE_LANGUAGES`, `VITE_DEFAULT_LANGUAGE`, `VITE_APP_NAME` | Fallback when the backend is not reachable during the build |

---

## 6. Forms

Forms are described once on the backend (`app/forms.py`) and rendered here:

```tsx
<SchemaForm name="contact" />
```

- `GET /forms/<name>` gives the title, submit label and fields with labels in the current
  language; the form reloads it when the language changes.
- Field types: `text`, `textarea`, `email`, `tel`, `password`, `number`, `select`,
  `multiselect`, `checkbox`, `consent`. Client rules come from the same description as the
  server ones (`src/components/SchemaForm/rules.ts`).
- The hidden honeypot field is off-screen, not `display: none`: bots skip fields that are
  obviously hidden.
- `POST /forms/<name>`: per-field server errors are shown under the fields; any other
  failure shows an alert with **Try again**. Success replaces the form with the server
  message and **Send another**.
- `consent` links to the privacy policy (`PRIVACY_POLICY_PATH`, `src/utils/constants.ts`).
- `SchemaFields` renders just the fields inside your own Ant Design `Form` (the admin
  settings and channels use it).
- Example: `src/examples/contact`.

### Captcha

When `/bootstrap` has `captcha` (set up on the backend), `SchemaForm` and the sign-up page
show the Cloudflare Turnstile widget, keep the submit button off until there is a token and
send it in `X-Captcha-Token`. The Cloudflare script is added to the page only then
(`src/components/Captcha`). In another form: `const captcha = useCaptcha()`, render
`captcha.widget`, send `captcha.token`, call `captcha.reset()` after every attempt (a token
works once). Mention Cloudflare in the privacy policy.

---

## 7. Look and data

### Brand and theme

Colours, radius and font live in `src/config/brand.ts` (light and dark palettes). Ant Design
themes are built from it (`src/components/AppComponent/theme.ts`), and `ThemeVariables`
exposes the derived colours to custom CSS: `--color-primary`, `--color-primary-bg`,
`--color-bg`, `--color-surface`, `--color-text`, `--color-text-secondary`, `--color-border`,
`--color-fill`, `--radius`, `--shadow`. Use them instead of hex values; do not override Ant
Design classes globally. The chosen theme is kept in `localStorage`. The icon is
`public/favicon.svg`.

Font: Roboto WOFF2 subset (Latin + Cyrillic, about 23 KB per weight); see
`src/assets/fonts/Roboto/README.md` to add a language or drop the font.

### Landing blocks

`src/components/blocks`: `Hero`, `Services`, `Gallery`, `Pricing`, `Reviews`, `Faq`, `Cta`
and the `Section` wrapper (`id` for anchors, `tone`: plain / surface / primary). Content
comes in props, texts from translations; styles use the brand variables. Example:
`src/examples/landing`.

### Images

`<Image image={...} alt sizes priority />` renders `<picture>` with AVIF / WebP, lazy
loading, async decoding and a fixed size (no layout jumps); `priority` for the first
screen. Put originals in `src/assets/images/source` and run `npm run images` (sharp, dev
only) to get 640 / 1280 / 1920 px variants and `generated/index.ts`
(`src/assets/images/README.md`).

### Tables

`DataTable` (`src/components/DataTable`) wraps the Ant Design `Table` with a search box,
column filters, sorting and pagination. The state is in the URL
(`?q=&page=&size=&sort=-total&status=paid,new`), so a filtered table survives a reload and
can be shared; `urlPrefix` separates several tables on one page.

- `data={rows}`: everything runs in the browser (`searchable`, `sortable`, `filters` on
  columns).
- `fetch={(query) => api...}`: the server gets the page, search, sort and filters and
  returns `{ items, total }`; the table shows a loader and an error with retry. A new
  `refreshKey` fetches the current page again (e.g. after a row changed).
- `onExport={(query) => ...}`: an **Export CSV** button, called with the current search,
  sort and filters (`downloadFile` in `src/api/download.ts`); `listParams` / `exportParams`
  (`query.ts`) turn the query into backend parameters.
- A column `key` is the field name and the URL parameter, so `q`, `page`, `size`, `sort`
  are reserved. Define columns with `useMemo`.

### Formatting

`useFormat()` (`src/i18n/format.ts`): `date`, `dateTime`, `time`, `relative`
("3 days ago"), `number`, `percent`, `compact`, `currency` in the interface language, built
on `Intl` (no libraries). The default currency is in `src/config/format.ts`.

Charts: `BarChart` (`src/components/BarChart`) is a small bar chart in plain HTML and CSS
for dashboards; add a chart library only when a project needs more.

---

## 8. Backend API

- Requests go through `src/api/*` (the Axios instance in `src/api/axios.ts`, base URL
  `VITE_BASE_URL`: `http://localhost:8000/api/v1` by default, `/api/v1` in Docker). Every
  request sends `Accept-Language`, so error messages arrive translated.
- Sign-in is a cookie; a `401` on a protected request sends the user to `/login`.
- Errors: `getErrorMessage(error)` (`src/api/errors.ts`) gives the text to show,
  `getApiError(error)` the code and per-field errors; `setServerFieldErrors`
  (`src/utils/formErrors.ts`) puts them under the form fields.
- Types come from the backend schema: after an API change run `make openapi` there, then
  `npm run generate:client` here and commit `src/api/generated`. CI fails when they are out
  of date.

---

## 9. Legal, analytics and error tracking

- **Legal pages** `/privacy`, `/terms`, `/cookies` (`src/pages/Legal`) with placeholder
  texts in `src/locales/<language>/legal.json`. Fill the owner details in
  `src/config/legal.ts`; while a value is still in `[brackets]` the pages show a "template"
  notice. Review the texts for your country and your data processing.
- **Analytics and the cookie banner:** off by default. Set `VITE_ANALYTICS_SCRIPT` (the
  script URL of your provider; in Docker `ANALYTICS_SCRIPT` in the backend `.env`) and a
  banner asks for consent; the script loads only after **Accept** (`src/config/analytics.ts`,
  `src/consent`). The choice can be changed on the cookie policy page. Without analytics
  there is no banner.
- **Error tracking:** set `VITE_SENTRY_DSN` (Sentry or GlitchTip; in Docker
  `FRONTEND_SENTRY_DSN`) and `VITE_SENTRY_ENVIRONMENT`. Without the DSN the build has no
  Sentry code at all; with it `@sentry/browser` comes in its own chunk (about 32 KB gzipped)
  loaded after start, and errors that happen before it arrives are kept and sent then.
  Unhandled errors, rejected promises and what the error pages show are sent with the
  release `osnova-frontend@<version>`; `reportError` (`src/errorTracking`) for your own
  `catch` blocks. Nothing about the visitor: no user, cookies, headers or bodies, addresses
  without query and hash, no console lines (`src/errorTracking/scrub.ts`). No cookies are
  set, so it needs no consent.

---

## 10. Docker and security headers

A two-stage image (Node build → nginx) serves the site and proxies `/api`, `/docs`,
`/redoc` and `/openapi.json` to the `backend` service, so there is one origin and no CORS.
Usually it runs as part of the stack from osnova_backend (`make up-standard`), which passes
the site URL, languages, app name, analytics and DSN from the backend `.env`. On its own:

```bash
docker build --build-arg VITE_BASE_URL=/api/v1 --build-arg VITE_SITE_URL=https://example.com -t osnova-frontend .
```

nginx sends security headers with every answer: a Content Security Policy (the site, the
Turnstile captcha, the analytics origin and the DSN host; no inline scripts),
`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
`Cross-Origin-Opener-Policy`, and HSTS when the proxy in front reports HTTPS. The policy is
written at build time by `scripts/security-headers.mjs`; a service that loads or sends data
from another host needs `--build-arg CSP_EXTRA_ORIGINS="https://..."`. The headers come
only from nginx, not from `npm run dev`: check such a change in the image, the browser
console reports what the policy blocks. Request bodies of file uploads are limited by
`client_max_body_size` in `nginx.conf`: keep it in step with the backend's
`FILES_MAX_SIZE_MB`.

---

## 11. Tests and tooling

- **Unit tests:** Vitest, `npm test`. Tests sit next to the code as `*.test.ts` and cover
  pure logic (formatting, table query, navigation, language URLs, API errors, the strip and
  upgrade scripts); they run in Node, no browser.
- **End-to-end tests:** Playwright in `e2e/`: the home page and its language switch, the
  contact form, sign-in and sign-out, a form that becomes a lead in the admin, the users,
  roles and settings pages. A module's tests are `e2e/<module>.e2e.ts` (and
  `<module>.setup.ts` when it signs in), so `npm run strip` removes them with the module.
  Start the stack in osnova_backend (`make init`, `make up-standard`, `make createroot`),
  then:

  ```bash
  npx playwright install chromium
  E2E_EMAIL=root@example.com E2E_PASSWORD=... npm run e2e
  ```

  `E2E_BASE_URL` points elsewhere (default `http://localhost:8080`). The tests create a lead
  and a role each run (the role is deleted again): use a throwaway database. The forms
  accept 5 submissions a minute from one address, so wait a minute before running them
  again.

CI runs the lint, type check, tests, checks the API types against the backend schema and
builds; it strips a copy for each module; another job starts the standard stack with
Docker Compose and runs the end-to-end tests in Chromium.

---

## 12. Upgrading

```bash
npm run upgrade -- v1.1.0
```

It works like `make upgrade` in the backend (backend DOCUMENTATION.md → Upgrading and
versions): `.osnova-version` holds the release the project is on; the new one is fetched
from the template repository (another address: `-- v1.1.0 --upstream <git address>`) and
merged into the current branch. Modules removed with `npm run strip` stay removed (with
their end-to-end tests), `README.md`, `CHANGELOG.md` and the project's version number stay,
and a `package-lock.json` in conflict is written again from the merged `package.json`. A
line changed on both sides is left to resolve by hand. Then: `npm install`,
`npm run lint`, `npm run typecheck`, `npm test`.

---

## 13. Common tasks

| Task | How |
|---|---|
| Hide the menu | `enabled: false` in `navigationConfig` |
| Menu on top | `position: 'top'` |
| Hide an item when a capability is off | `capability: 'authentication'` (etc.) |
| Show an item only with a permission | `permission: 'leads.read'` |
| Add a redirect | `{ from: '/old', to: '/new' }` in `redirects` |
| Change brand colours | `src/config/brand.ts` |
| Add a translation key | `src/locales/en/<namespace>.json` first, then the other languages |
| A new admin section | an item in `src/modules/admin/navigation.ts`, a route in `src/modules/admin/index.tsx` |
