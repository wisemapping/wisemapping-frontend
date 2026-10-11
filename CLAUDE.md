# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Yarn 4 + Lerna monorepo (workspaces under `packages/*`), Node `>=24`. Versioning is `independent` per package. The four packages form a layered stack — changes lower in the stack must be rebuilt before consumers pick them up:

- `packages/web2d` — thin SVG abstraction layer; foundation for rendering.
- `packages/mindplot` — vanilla ES6/TS canvas library that renders and edits mind maps. Depends on `web2d`. No React.
- `packages/editor` — React component wrapper around `mindplot`. Built with Vite as a UMD+ESM library (`dist/editor.{es,umd}.js`). MUI v9 + Emotion.
- `packages/webapp` — the React application (Vite, react-router 7, MUI v9, react-query). Consumes `@wisemapping/editor`. Talks to the backend at `wisemapping-open-source` (separate repo); base API URL is configured via `API_URL` env var.

Each package declares every dependency its code, configs and scripts use (ESLint plugins, Jest presets and environments, Babel presets, `@types/*` named in its tsconfig `types`, CLIs in its scripts), even when another package declares it too: Yarn installs one copy, and nothing relies on hoisting. The root declares only what the root uses (its ESLint config and Vercel functions, lerna, husky, lint-staged, prettier, `scripts/`).

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

## Types: strictness, `undefined` and `null`

Every package (and its Cypress and Storybook type checks) extends `tsconfig.strict.json` (root): `strict` plus `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` (a key from an index signature is read `obj['key']`), `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`. Change the checks there, for all packages at once; a package's own tsconfig only adds what is specific to it (web2d: `verbatimModuleSyntax`, `isolatedDeclarations`). An unused parameter that a signature needs is prefixed with `_`.

**`undefined` is "absent"; `null` only where something outside our code defines it.**

- Our own types, parameters, fields and return values express absence with `undefined`: optional properties and parameters (`name?: string`), "not found" / "not set" results (`findTopic(id): Topic | undefined`), fields not set yet, a value cleared. Not `null`, and not both (`T | null | undefined`).
- `null` stays where an API we do not own defines it, and is converted at that boundary (`?? undefined`) before it enters our model: DOM APIs (`getAttribute`, `querySelector`, `parentElement`), `JSON.parse` and backend payloads that send `null`, third-party APIs that take or return `null`. React keeps its own: element refs (`useRef<HTMLDivElement>(null)`) and a component rendering nothing (`return null`).
- With `exactOptionalPropertyTypes`, an optional property written `undefined` on purpose (cleared, or copied from a value that may be missing) is typed `?: T | undefined`; otherwise leave the key out.
- Checks match the type: `x === undefined` / `x !== undefined`, `x ?? fallback`, `x?.y`; `=== null` only on a boundary value typed `| null`. No loose `== null` / `!= null`: a value is never both.

## Bundle size

The webapp resolves `@wisemapping/editor`, `mindplot` and `web2d` to their sources (`vite.config.mts` aliases), and the editor and mindplot barrels can not be tree-shaken: one value import of `@wisemapping/editor` or `@wisemapping/mindplot` puts the whole editor (about 1.3 MB) in that chunk. So:

- Outside the editor page, import an editor module by path (`@wisemapping/editor/components/editor-loading-skeleton`, `@wisemapping/editor/theme/dialog`), use `import type` for types, and load anything that needs the editor with `React.lazy` / `import()` (the export and import dialogs do). `test/unit/bundle/entry-imports.test.ts` fails, naming the chain, when the entry or the map list reaches a barrel.
- Large libraries used by one action load on demand: jspdf and html2canvas on PDF export, emoji-picker-react when a picker opens, each locale's messages when it is the user's (English is bundled as the fallback; route loaders preload the user's locale so the first paint is translated).

## i18n

`editor` and `webapp` use `react-intl` with FormatJS AST compilation. Source of truth is `lang/en.json`; other locales (es, fr, de, zh, zh-CN, ru, uk, ja, pt, it, hi, ar) are compiled into `src/compiled-lang/` at build time. Workflow:

```sh
yarn workspace @wisemapping/editor i18n:extract   # regenerate en.json from source
yarn workspace @wisemapping/editor i18n:compile   # produce compiled-lang/*.json
```

`i18n:compile` runs automatically as part of `build`. Adding a locale requires editing both `i18n:compile` scripts (editor + webapp) since the language list is hardcoded.

## Styling (Material UI)

`webapp` and `editor` use MUI v9 with its default engine, Emotion. Every style goes through one of these, chosen by scope (MUI's own guidance: [How to customize](https://mui.com/material-ui/customization/how-to-customize/), [Theme components](https://mui.com/material-ui/customization/theme-components/), [Dark mode](https://mui.com/material-ui/customization/dark-mode/)):

| Scope                                                                               | Use                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| One instance, a one-off tweak                                                       | the `sx` prop, with theme tokens (`color: 'text.secondary'`, `mt: 2`, breakpoints)                                                                                                                                                                     |
| A component reused, or styled from props                                            | `styled()` from `@mui/material/styles`, in the folder's `styled.ts`; `shouldForwardProp` keeps style-only props off the DOM                                                                                                                            |
| Every instance of an MUI component, or a look shared by several (dialogs, cards...) | the theme: `components.MuiX.styleOverrides` and `variants` (not `ownerState` callbacks, which MUI deprecated). A look shared by the webapp and the editor is defined once in `packages/editor/src/theme/` and imported by path (see `theme/dialog.ts`) |
| Dark and light                                                                      | theme tokens (`palette.*`); for a style that differs by mode use `theme.applyStyles('dark', {...})`, not `theme.palette.mode ===` in a component. New code does not read the mode                                                                      |

Project rules (our decisions, not MUI's):

- **One mechanism.** MUI documents Emotion's `css` prop and styled-components as valid, but we keep to `sx` and `styled()`. Do not add new `css=` props, `styled-components` (a second CSS-in-JS runtime in the bundle), the `withEmotionStyles` HOC or `useClasses`/`useStyles`; when touching a file that has them, migrate what you touch.
- **Tokens, not literals.** Spacing through `theme.spacing` / the `sx` spacing shorthand, colours through `palette` (no hex in components, apart from brand assets), radii and shadows from the theme. No `style={{}}`.
- **Styles live next to the component** in `styled.ts` (or `style.ts`), not inline in a 100-line JSX; an `sx` with more than a few rules becomes a `styled()` component.
- **Imports by path** (`@mui/material/Button`, `@mui/icons-material/Delete`), never from the package barrel.
- **Current MUI API**: `slotProps` (not `InputProps`/`inputProps`/`InputLabelProps`), `onKeyDown` (not `onKeyPress`), no `defaultProps` on components.

User-visible text always goes through react-intl (see i18n above): no English literals in JSX, `title`/`label`/`placeholder`/`aria-label`/`alt` props, or error messages.

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

Branch from `develop` (not `main`) using `feature/*` or `bugfix/*`. Husky pre-commit runs `lint-staged` (eslint per package + `prettier --check`) on the staged files; pre-push runs `yarn lint && yarn test`. Don't bypass these — CI runs the same checks.

The pre-commit hook only checks, it does not fix: a lint or formatting error refuses the commit and leaves the index and working tree as they were. Fix them with `yarn lint:fix` (or `cd packages/<pkg> && npx eslint --fix <files>`) and `npx prettier --write <files>`, re-stage and commit again. Being check-only lets it run with `--no-stash`: lint-staged's backup would go to `git stash`, which every worktree of the repo shares, so parallel commits in different worktrees raced on it. `yarn test:precommit` (`scripts/test-precommit-concurrency.sh`) commits concurrently in several worktrees of a scratch repo to prove the hook neither loses changes nor touches `git stash list`.
