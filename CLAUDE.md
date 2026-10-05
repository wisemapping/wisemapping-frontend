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

The web2d, mindplot and editor Cypress specs compare their screenshots with committed baselines through `@simonsmith/cypress-image-snapshot` (`cy.matchImageSnapshot('name')`). Baselines live in `packages/{web2d,mindplot,editor}/cypress/snapshots/<spec>/<name>.snap.png`; diffs go to `.../__diff_output__/` (git-ignored). **Baselines are rendered natively on macOS** (headless Chrome, via Cypress). Fonts and anti-aliasing differ between operating systems, so another OS does not match them.

```sh
yarn workspace @wisemapping/editor test:visual          # verify: fails on a diff or a missing baseline
yarn workspace @wisemapping/editor test:visual:update   # write missing / changed baselines
# same for @wisemapping/web2d and @wisemapping/mindplot
```

- Visual regression is part of the normal run: `test:integration` (and so `yarn test` and the pre-push hook) compares in `verify` mode. `test:visual` runs the same Storybook (web2d, mindplot) or playground (editor) + Cypress flow with `VISUAL_SNAPSHOTS=verify`; `test:visual:update` with `VISUAL_SNAPSHOTS=update`. The editor's visual suite is the playground one (`test:integration:playground`); its Storybook smoke specs take no snapshots.
- The flow is `scripts/run-storybook-cypress.js`: it starts the server, runs `cypress run --browser chrome` and stops it. It unsets `ELECTRON_RUN_AS_NODE`, which Electron-based hosts set and which keeps the Cypress binary from starting. Each package's `cypress/plugins` launches headless Chrome with a 1600x1200 window, so screenshots are taken at the configured 1000x660 viewport: with the default 1280x720 window, Cypress shrinks the page while it captures, and the resize lands in the middle of the capture.
- After an intended visual change, regenerate the affected baselines with `test:visual:update`, review every changed PNG (`git status`, open the old and new image, or the `__diff_output__` diff from the failing verify run) and commit them with the code. `update` only rewrites the baselines that differ; to drop obsolete ones, delete the spec's snapshot folder before updating.
- Threshold (each package's `cypress/support/commands.*`): a snapshot fails when more than 10 pixels differ, with a per-pixel YIQ tolerance of 0.01, which still flags a darker shade of the same colour. Repeated native runs are pixel-identical for web2d and mindplot; for the editor 3 of 128 snapshots differed by 2 px. Before capturing, snapshots wait for the story/map to load and its markup to settle, freeze CSS transitions, animations and the caret, hide MUI hover tooltips (timer races), click ripples (frozen mid-animation) and overlay scrollbars (they fade out on a timer), and black out the third-party emoji-picker grid.
- The specs also fail on `console.error` (web2d, editor) and `console.warn` (web2d, mindplot). The checks keep their own reference to the spies, because the Vite dev client wraps the console when it forwards it to the terminal (`server.forwardConsole`, on by default under AI agents).

## Contributing flow

Branch from `develop` (not `main`) using `feature/*` or `bugfix/*`. Husky pre-commit runs `lint-staged` (eslint + prettier per package); pre-push runs `yarn lint && yarn test`. Don't bypass these — CI runs the same checks.
