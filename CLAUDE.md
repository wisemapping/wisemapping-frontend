# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Yarn 4 + Lerna monorepo (workspaces under `packages/*`), Node `>=24`. Versioning is `independent` per package. The four packages form a layered stack — changes lower in the stack must be rebuilt before consumers pick them up:

- `packages/web2d` — thin SVG abstraction layer; foundation for rendering.
- `packages/mindplot` — vanilla ES6/TS canvas library that renders and edits mind maps. Depends on `web2d`. No React.
- `packages/editor` — React component wrapper around `mindplot`. Built with Vite as a UMD+ESM library (`dist/editor.{es,umd}.js`). MUI v7 + Emotion + styled-components.
- `packages/webapp` — the React application (Vite, react-router 7, MUI v7, react-query). Consumes `@wisemapping/editor`. Talks to the backend at `wisemapping-open-source` (separate repo); base API URL is configured via `API_URL` env var.

Top-level extras:

- `middleware.ts` — Vercel Edge middleware that intercepts `/c/maps/:id/public` and proxies/handles 410 (deleted map) responses against `API_URL`.
- `api/sitemap.ts` — Vercel serverless sitemap.
- `vercel.json` — deploy config; the webapp is the deployable unit.

## Common commands

Run from repo root unless noted. `lerna run X` fans out to every package; use `--scope @wisemapping/<pkg>` to target one.

```sh
nvm use
yarn install
export NODE_OPTIONS=--openssl-legacy-provider   # required for builds

yarn build                                       # build all packages
yarn lint                                        # eslint across all packages
yarn lint:fix
yarn test                                        # all tests (unit + integration)
yarn test:unit
yarn test:integration

# Single package
yarn workspace @wisemapping/mindplot test:unit
yarn workspace @wisemapping/editor build
yarn workspace @wisemapping/webapp dev          # vite dev server on :3000

# Playgrounds (browsable examples for lib packages)
yarn playground --scope @wisemapping/web2d
yarn playground --scope @wisemapping/mindplot

# Single Jest test file (mindplot/editor)
cd packages/mindplot && yarn jest test/unit/path/to/file.test.ts
```

Storybook is the integration-test harness for `web2d`, `mindplot`, and `editor` — `test:integration` boots Storybook (or Vite playground) on a fixed port and runs Cypress against it via `scripts/run-storybook-cypress.js` / `start-server-and-test`. Ports: web2d 6106, mindplot 6107, editor playground 8081 + storybook 6008, webapp 3000. Tests use dynamic port allocation that will kill blockers — see `TESTING_PORT_ALLOCATION.md`.

## i18n

`editor` and `webapp` use `react-intl` with FormatJS AST compilation. Source of truth is `lang/en.json`; other locales (es, fr, de, zh, zh-CN, ru, uk, ja, pt, it, hi, ar) are compiled into `src/compiled-lang/` at build time. Workflow:

```sh
yarn workspace @wisemapping/editor i18n:extract   # regenerate en.json from source
yarn workspace @wisemapping/editor i18n:compile   # produce compiled-lang/*.json
```

`i18n:compile` runs automatically as part of `build`. Adding a locale requires editing both `i18n:compile` scripts (editor + webapp) since the language list is hardcoded.

## Image-snapshot tests

`cypress-image-snapshot` is host-sensitive (fonts/AA differ between machines). Run snapshot tests via Docker to match CI:

```sh
docker-compose -f docker-compose.snapshots.yml up                # verify
docker-compose -f docker-compose.snapshots.update.yml up         # accept changes
```

Commit updated PNGs alongside the code change.

## Contributing flow

Branch from `develop` (not `main`) using `feature/*` or `bugfix/*`. Husky pre-commit runs `lint-staged` (eslint + prettier per package); pre-push runs `yarn lint && yarn test`. Don't bypass these — CI runs the same checks.
