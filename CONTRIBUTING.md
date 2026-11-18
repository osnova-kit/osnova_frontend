# Contributing

Thanks for helping with Osnova! The project has two repositories:
[osnova_backend](https://github.com/osnova-kit/osnova_backend) and
[osnova_frontend](https://github.com/osnova-kit/osnova_frontend) (this one).
How the interface is built: [DOCUMENTATION.md](DOCUMENTATION.md); ideas and bugs go to the issues.

## Setup

```bash
npm install
npm run dev           # http://localhost:5173, expects the backend on http://localhost:8000
```

Start the backend from `../osnova_backend` (`make dev`), or the whole stack in Docker
there (`make up-minimal`).

## Workflow

1. Create a branch from `main`: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
2. Use [Conventional Commits](https://www.conventionalcommits.org/).
3. Before pushing: `npm run lint` (Biome), `npm test` (Vitest) and `npm run build`
   (type check + build);
   `npm run format` fixes formatting.
4. Open a pull request using the template. CI must be green.
5. Note user-visible changes in [CHANGELOG.md](CHANGELOG.md) under *Unreleased*.

## Architecture rules

- The backend is the source of truth: routes and UI are built from `GET /api/v1/bootstrap`.
- **Module = folder.** Optional features live in `src/modules/<name>/`; `index.tsx` exports
  their routes. Pages are loaded with `lazyElement()` so a disabled or unvisited module is
  never downloaded.
- Core code imports a module only through its `index.tsx`.
- Dependabot (`.github/dependabot.yml`) proposes the minor and patch updates once a month,
  one PR per kind (dependencies, dev dependencies, images, GitHub Actions); major versions
  and minor ones of `@hey-api/openapi-ts` (it changes the generated client) by hand.

## Code style

Biome only (`biome.json`). Names carry the meaning; JSDoc only where a name does not tell
enough, a comment only for unusual behaviour.

## Tests

Unit and end-to-end tests, and what CI runs: [DOCUMENTATION.md](DOCUMENTATION.md#11-tests-and-tooling).
