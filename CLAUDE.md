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

The mindplot and editor Cypress specs compare their screenshots with committed baselines through `@simonsmith/cypress-image-snapshot` (`cy.matchImageSnapshot('name')`). Baselines live in `packages/{mindplot,editor}/cypress/snapshots/<spec>/<name>.snap.png`; diffs go to `.../__diff_output__/` (git-ignored). Pixels depend on fonts, anti-aliasing and CPU, so **baselines are generated and verified only in Docker** (`Dockerfile.snapshots`: pinned `cypress/included` 16.1.1, `linux/amd64`, MS core fonts and Noto colour emoji). It needs Docker, so it is not part of the pre-push hook.

```sh
docker compose -f docker-compose.snapshots.yml up                # verify mindplot + editor, exits 1 on a diff
docker compose -f docker-compose.snapshots.update.yml up         # write missing / changed baselines
VISUAL_SUITES=mindplot docker compose -f docker-compose.snapshots.yml up   # one suite (mindplot | editor)

yarn workspace @wisemapping/mindplot test:visual                 # same, per package (also editor)
yarn workspace @wisemapping/mindplot test:visual:update
```

- The mode comes from `VISUAL_SNAPSHOTS` (set by the compose files): `verify` fails on a diff or a missing baseline, `update` rewrites baselines. Unset (a host `yarn test:integration`) still compares, but only logs differences in the Cypress command log and never writes baselines, since host renders never match the Docker ones.
- Threshold: a snapshot fails when more than 0.05 % of its pixels differ (`failureThreshold: 0.0005`; per-pixel YIQ tolerance 0.01, which still flags a darker shade of the same colour), set in each package's `cypress/support/commands.*`. Repeated Docker runs are pixel-identical for mindplot and differ by at most ~32 px (0.005 %) for editor, so the threshold only absorbs anti-aliasing. Before capturing, snapshots wait for the story/map to load and its markup to settle, freeze CSS transitions, animations and the caret, hide MUI hover tooltips (timer races), and black out the third-party emoji-picker grid.
- A rendering change must update the affected baselines in the same commit: run the update compose file, review every changed PNG (`git diff --stat`, open the old and new image), and commit them with the code. To drop obsolete baselines, delete the spec's snapshot folder before updating.
- The first build downloads the fonts and installs dependencies into the image; later runs rebuild only the source layer.

## Contributing flow

Branch from `develop` (not `main`) using `feature/*` or `bugfix/*`. Husky pre-commit runs `lint-staged` (eslint + prettier per package); pre-push runs `yarn lint && yarn test`. Don't bypass these — CI runs the same checks.
