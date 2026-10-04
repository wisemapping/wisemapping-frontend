# Mindplot Review: Bugs, Typing, Performance and Test Coverage

Review of `packages/mindplot`, about 32.5k lines in 198 files, carried out on 2026-10-04 against `develop` (`ca179c73`).

Unless noted otherwise, paths are relative to `packages/mindplot/src/components/`.

Severity levels:

- **H**: user-visible data loss, a security problem, or a broken feature.
- **M**: incorrect behaviour that is narrower or easy to work around.
- **L**: cosmetic, latent, or cleanup.

Every **H** item and most **M** items were checked against the source. Several were also reproduced in jsdom or node.

---

## 0. Fix status

Each fix is confirmed as a real bug before it is changed. Confirmation means a failing unit test first, plus a check of comments, git history and callers for intended behaviour. Fixes land on `develop` as one commit per group, each with its tests. Agents ran unit tests, lint and `tsc` only; the Cypress integration suite is run once on `develop` after the merge.

Legend: ⏳ in progress · ✅ fixed · 🚫 not a bug (expected behaviour, reason given) · ⏸ deferred (not in this round)

| ID            | Item (section)                                                                              | Group            | Status                                                                                                             | Commit     |
| ------------- | ------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------ | ---------- |
| P0            | Coverage gate in `test:unit`, `testPathIgnorePatterns`, pre-push dead branch (6.3)          | Tooling          | ✅                                                                                                                 | `59d0f0ed` |
| S1            | HtmlSanitizer bypass (2)                                                                    | G1 Security      | ✅                                                                                                                 | `3dc7298c` |
| S2            | Link/note tooltips via `innerHTML`, `_fixUrl` (2)                                           | G1 Security      | ✅                                                                                                                 | `3dc7298c` |
| S3            | `getPlainText()` executes HTML (2)                                                          | G1 Security      | ✅                                                                                                                 | `3dc7298c` |
| S4            | TXT/MD export note ternary inverted (2)                                                     | G1 Security      | ✅                                                                                                                 | `3dc7298c` |
| D1            | Emoji stripped on save (2)                                                                  | G2 Serializer    | ✅                                                                                                                 | `d28eddf4` |
| D2            | `]]>` makes map unsaveable (2)                                                              | G2 Serializer    | ✅                                                                                                                 | `d28eddf4` |
| D6            | Dangling relationship guard `!== null` (2)                                                  | G2 Serializer    | ✅                                                                                                                 | `d28eddf4` |
| B-SHRINK      | `shrink="false"` read as true (3.4)                                                         | G2 Serializer    | ✅                                                                                                                 | `d28eddf4` |
| D3            | Throttled saves dropped, promise never settles (2)                                          | G3 Persistence   | ✅                                                                                                                 | `b4b7add2` |
| D4            | Edit during in-flight save lost (2)                                                         | G3 Persistence   | ✅                                                                                                                 | `b4b7add2` |
| D8            | Content-Type header / `parsererror` on load (2)                                             | G3 Persistence   | ✅                                                                                                                 | `b4b7add2` |
| B-MODE        | Web component default mode `'viewonly'` is editable (3.1)                                   | G3 Persistence   | ✅                                                                                                                 | `b4b7add2` |
| B-UNLOCK      | `unlockMap` null dereference (3.1)                                                          | G3 Persistence   | ✅                                                                                                                 | `b4b7add2` |
| B-SETTLE      | LocalStorage/Mock `save()` never settles, XML logged (3.4)                                  | G3 Persistence   | ✅                                                                                                                 | `b4b7add2` |
| D5            | Delete undo loses topics (2)                                                                | G4 Undo          | ✅                                                                                                                 | `41db729a` |
| B-MERGE       | Undo merging across different topics (3.1)                                                  | G4 Undo          | ✅                                                                                                                 | `41db729a` |
| B-COLOR       | Color undo stores theme-resolved color (3.1)                                                | G4 Undo          | ✅                                                                                                                 | `41db729a` |
| B-GFC         | GenericFunctionCommand old values by index (3.1)                                            | G4 Undo          | ✅                                                                                                                 | `41db729a` |
| B-SHRINKUNDO  | Shrink undo assumes `!isShrink` (3.1)                                                       | G4 Undo          | ✅                                                                                                                 | `41db729a` |
| B-RELCMD      | Relationship command holds object refs (3.1)                                                | G4 Undo          | ✅                                                                                                                 | `41db729a` |
| B-FEATSHARE   | One FeatureModel shared by all selected topics (3.1)                                        | G4 Undo          | ✅                                                                                                                 | `41db729a` |
| B-EMPTYUNDO   | Undo/redo on empty stack marks map dirty (3.1)                                              | G4 Undo          | ✅                                                                                                                 | `41db729a` |
| B-LINE        | `LineTopicShape` reports `'image'` (3.2)                                                    | G5 Topic         | ✅                                                                                                                 | `9a8e3dfa` |
| B-LINK        | `setLinkValue(undefined)` crash (3.2)                                                       | G5 Topic         | ✅                                                                                                                 | `9a8e3dfa` |
| B-NOTE        | Clearing empty note creates blank note (3.2)                                                | G5 Topic         | ✅                                                                                                                 | `9a8e3dfa` |
| B-SIZE        | `setSize` aliasing / rounding (3.2)                                                         | G5 Topic         | ✅ rounding · 🚫 oldSize aliasing (copying it would revive dead xOffset code that misplaces topics in tree layout) | `9a8e3dfa` |
| B-ESC         | Esc writes placeholder into model (3.2)                                                     | G5 Topic         | ✅                                                                                                                 | `9a8e3dfa` |
| B-IME         | Enter during IME composition commits (3.2)                                                  | G5 Topic         | ✅                                                                                                                 | `9a8e3dfa` |
| B-CENTRAL     | CentralTopic `updateTopicShape` skips super (3.2)                                           | G5 Topic         | ✅                                                                                                                 | `9a8e3dfa` |
| B-CMDCLICK    | Cmd/Ctrl-click deselects others (3.2)                                                       | G6 Selection     | ✅                                                                                                                 | `fa2c6c57` |
| B-EMOJIWIDGET | Delete-widget listeners grow per redraw (3.2)                                               | G6 Selection     | ✅                                                                                                                 | `fa2c6c57` |
| B-EMOJISWAP   | Emoji A→B leaves old glyph (3.2)                                                            | G6 Selection     | ✅                                                                                                                 | `fa2c6c57` |
| B-SHADOWLEAK  | HTMLTopicSelected listeners never removed (3.2)                                             | G6 Selection     | ✅                                                                                                                 | `fa2c6c57` |
| B-HOVER       | Hover closure keeps stale colors (3.2)                                                      | G6 Selection     | ✅                                                                                                                 | `fa2c6c57` |
| B-EICON       | IconGroup has no `'eicon'` order (3.2)                                                      | G6 Selection     | ✅                                                                                                                 | `fa2c6c57` |
| B-TOUCH       | Touch listeners removed swapped (3.3)                                                       | G7 Canvas        | ✅                                                                                                                 | `e6a823f3` |
| B-PINCH       | Pinch leaves workspace events disabled (3.3)                                                | G7 Canvas        | ✅                                                                                                                 | `e6a823f3` |
| B-DESTCP      | `setDestControlPoint` sets src on focus shape (3.3)                                         | G7 Canvas        | ✅                                                                                                                 | `e6a823f3` |
| B-SCROLL      | ScreenManager mixes clientX and scrollX (3.3)                                               | G7 Canvas        | ✅                                                                                                                 | `e6a823f3` |
| B-CPCLICK     | Click on control point adds undo entry (3.3)                                                | G7 Canvas        | ✅                                                                                                                 | `e6a823f3` |
| B-SYM         | SymmetricSorter cross-parent drop off by one (3.3)                                          | G8 Layout        | ✅                                                                                                                 | `937aa7ce` |
| B-BAL         | BalancedSorter same-side downward drop (3.3)                                                | G8 Layout        | ✅                                                                                                                 | `937aa7ce` |
| B-TREE        | TreeSorter predict index mix-up (3.3)                                                       | G8 Layout        | ✅                                                                                                                 | `937aa7ce` |
| B-VERIFY      | BalancedSorter.verify skips left side (3.3)                                                 | G8 Layout        | ✅                                                                                                                 | `937aa7ce` |
| B-SIBLING     | New sibling lands on opposite side (3.1)                                                    | G8 Layout        | ✅                                                                                                                 | `937aa7ce` |
| B-REORDER     | topicReorder uses index as order (3.6)                                                      | G8 Layout        | ✅                                                                                                                 | `937aa7ce` |
| B-OPML        | OPML import always fails (3.5)                                                              | G9 Import/Export | ✅                                                                                                                 | `09cd96cd` |
| B-FMVER       | FreeMind version check inverted (3.5)                                                       | G9 Import/Export | ✅                                                                                                                 | `09cd96cd` |
| B-FMREL       | FreeMind arrowlinks dropped/duplicated (3.5)                                                | G9 Import/Export | ✅                                                                                                                 | `09cd96cd` |
| B-FMDEPTH     | FreeMind `depth++` (3.5)                                                                    | G9 Import/Export | ✅                                                                                                                 | `09cd96cd` |
| B-FMFEAT      | FreeMind features attached to previous sibling (3.5)                                        | G9 Import/Export | ✅                                                                                                                 | `09cd96cd` |
| B-XMSEL       | XMind invalid `local-name()` selector (3.5)                                                 | G9 Import/Export | ✅                                                                                                                 | `09cd96cd` |
| B-DESC        | Descendant selectors leak child data to ancestors (3.5)                                     | G9 Import/Export | ✅                                                                                                                 | `09cd96cd` |
| B-FMEXP       | FreemindExporter `rgbToHex` / bold (3.5)                                                    | G9 Import/Export | ✅                                                                                                                 | `09cd96cd` |
| D7            | SecureXmlParser strips predefined entities (2)                                              | G9 Import/Export | ✅                                                                                                                 | `09cd96cd` |
| B-THIN        | THIN_CURVED (0) treated as unset (3.6)                                                      | G10 Theme/i18n   | ✅                                                                                                                 | `bc4ee6ca` |
| B-COLORUTIL   | `lightenColor` invalid hex (3.6)                                                            | G10 Theme/i18n   | ✅                                                                                                                 | `bc4ee6ca` |
| B-ROBOTFILL   | Robot/Classic fill is an array (3.6)                                                        | G10 Theme/i18n   | ✅                                                                                                                 | `bc4ee6ca` |
| B-LOCALE      | `zh-CN` fallback, no English key fallback (3.6)                                             | G10 Theme/i18n   | ✅                                                                                                                 | `bc4ee6ca` |
| B-JAPT        | ja/pt bundles missing mindplot keys (3.6)                                                   | G10 Theme/i18n   | ✅                                                                                                                 | `bc4ee6ca` |
| B-LINKNOTE    | `$msg('LINK'/'NOTE')` missing (3.6)                                                         | G10 Theme/i18n   | ✅                                                                                                                 | `bc4ee6ca` |
| B-KEYS        | Modifier order / `ctrl+plus` never match (3.6)                                              | G10 Theme/i18n   | ✅                                                                                                                 | `bc4ee6ca` |
| B-NOTIFIER    | ToolbarNotifier debounce never cancelled (3.6)                                              | G10 Theme/i18n   | ✅                                                                                                                 | `bc4ee6ca` |
| —             | FreeplaneExporter stub (3.5)                                                                | —                | ⏸ product decision: implement or hide in webapp                                                                    |            |
| —             | `zoomToFit` convention, MUI AppBar (3.1)                                                    | —                | ⏸ needs design with editor                                                                                         |            |
| —             | Designer dispose, per-Designer event bus (3.1, 3.3)                                         | —                | ⏸ Phase 3 (typing foundation)                                                                                      |            |
| —             | Remaining M/L rows not listed above, section 5 performance                                  | —                | ⏸ later phases                                                                                                     |            |
| P0b           | Raise coverage threshold to 66/56/64/66                                                     | Tooling          | ✅                                                                                                                 | `c73779e3` |
| B-ENTERNL     | Regression from B-IME: committing Enter wrote `\n` into the topic (found by editor Cypress) | G5 Topic         | ✅                                                                                                                 | `d36e1c12` |

### Results of this round (2026-10-04)

- **63 items in 10 groups:** 62 fixed, and one partly not a bug: in B-SIZE, the `oldSize` aliasing.
- **Each fix has a test that failed before it**, so every one was confirmed as a real bug before it was changed.
- **Unit tests:** went from 33 suites / 355 tests to 74 suites / 674 tests.
- **Coverage:** went from 38.1 / 33.9 / 34.7 / 37.8 to **66.9 / 56.7 / 64.1 / 66.8** (statements / branches / functions / lines). The threshold has been raised to match.
- **Integration on `develop`:**
  - The mindplot Storybook + Cypress suite passes (22 passed, 1 skipped by the suite).
  - The only change it needed was in `BalancedTestSuite`, which asserted the old balanced drag prediction (`94d93485`).
  - `tsc` passes for the editor and the webapp, and the editor unit tests pass.
  - Editor Cypress (playground + Storybook): 138 of 144 passed, with 1 failure (`topicFontChange.cy.ts`). It was a regression from B-IME: a plain Enter added a trailing new line to the topic. It is fixed in `d36e1c12`, and the affected specs pass.
- **Snapshots regenerated in G9:** every one was reviewed, and each diff is a correction. The opml\*.wxml snapshots were error stubs. The bug3.mm and enc.mm snapshots contained `<parsererror>`. The FreeMind snapshots had lost their entities and had duplicated or missing relationships. The XMind and Freeplane snapshots had children's icons and notes copied onto their parents.
- **Behaviour changes to be aware of:**
  - **Saves within 10 s of the last write** are now delayed and merged with the pending save, instead of being dropped (D3).
  - **FreeMind 1.1.0 (beta) maps** are now rejected as `SUPPORTED_FREEMIND_VERSION` intends; before, the inverted check accepted them (B-FMVER).
  - **The default `<mindplot-component>` mode** is read-only (`viewonly-private`) (B-MODE).
  - **Topic sizes are integers again** (B-SIZE), which may shift Cypress image snapshots by up to 1 px.

### Follow-ups found while fixing (not done)

| Area          | Follow-up                                                                                                                                                                                            |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persistence   | ~~Plain-text notes with `%XX` corrupted by `unescape()`~~. 🚫 Not a bug (round 2, F-UNESCAPE): Tango writes note text as CDATA, and `unescape` only decodes legacy pela/beta attributes.             |
| Persistence   | Multi-line text with `]]>` is now written as several CDATA sections. The backend must read the whole text content (DOM `getTextContent()` does).                                                     |
| Persistence   | A flush right after an autosave now waits up to 10 s. A flush could bypass the interval; `beforeunload` should use `keepalive`/`sendBeacon`.                                                         |
| Web component | `storybook/src/stories/Layout.stories.ts:248` and `README.md:20` still use the invalid `mode="viewonly"`.                                                                                            |
| Editor        | `Editor.save(minor)` passes `minor` as `saveHistory`; the naming is inverted (it works only because callers pass `false`).                                                                           |
| Undo          | `StandaloneActionDispatcher.changeTextToTopic` stores `topic.getText()` (the placeholder for an empty topic), so undoing the first edit writes "Main Topic". It should store `getModel().getText()`. |
| Undo          | The layout `change` handler in `Designer` calls `topic.setOrder(undefined)` (it checks `!== null`). `DeleteCommand` works around this; `AddTopicCommand` (pasting a subtree) may hit it.             |
| Undo          | `SvgImageIcon` changes the icon type directly, outside undo. `ChangeFeatureToTopicCommand` would throw on icons (`setId` asserts a number).                                                          |
| Topic         | `TopicShapeFactory` builds `NoneTopicShape` for legacy `'image'` shapes, which reports `'none'`, so those topics still rebuild their shape on every redraw (same class as B-LINE).                   |
| Topic         | `MainTopic.updatePositionOnChangeSize` xOffset logic is dead code (see B-SIZE); remove it rather than revive it.                                                                                     |
| Designer      | No teardown: nothing calls the unsubscribe returned by `HTMLTopicSelected.initializeSelectionShadows` (part of Phase 3, Designer dispose).                                                           |
| Layout        | `BalancedSorter.predict` ("insert above first child" branch) uses `position.x > 0` instead of the side relative to the root's x (harmless while the root is at 0,0).                                 |
| Import        | `FreemindIconConverter.freeIdToIcon` is never populated, so FreeMind icons are never imported. `freemind/Map.loadFromDom` drops the root's icons, notes and arrowlinks, and has the `'clud'` typo.   |
| Import        | OPML uses only the first top-level `<outline>`; several outlines need a synthetic central topic.                                                                                                     |
| Security      | The sanitizer still allows `<img src>` to external hosts (tracking requests on render). Tooltip links lack `rel="noopener"`. `webapp` `revertHistory` sends `Content-Type: text/pain`.               |

### Round 2 (started 2026-10-04)

Same process as round 1. Still deferred: FreeplaneExporter stub, `zoomToFit`, Designer dispose and per-Designer event bus (Phase 3), the sanitizer's external `<img>` policy, backend CDATA reading.

| ID               | Item                                                                                                | Group            | Status                                                                                                         | Commit     |
| ---------------- | --------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------- | ---------- |
| B-DRAGLIST       | `DragManager` works on a stale topic list after the first delete (3.1)                              | R1 Designer      | ✅                                                                                                             | `8655c3e5` |
| B-PASTE          | Paste-as-child reverses siblings, empty clipboard leaves an undo step, expand outside command (3.1) | R1 Designer      | ✅                                                                                                             | `8655c3e5` |
| B-RMGOTO         | Recursive `removeTopic` focuses every deleted descendant (3.1)                                      | R1 Designer      | ✅                                                                                                             | `8655c3e5` |
| B-KBPAUSE        | Static keyboard `_disabled` shared by hover and dialogs (3.1)                                       | R1 Designer      | ✅                                                                                                             | `8655c3e5` |
| B-EVTFALSY       | `EventDispatcher` drops falsy payloads, skips handlers removed during dispatch (3.1)                | R1 Designer      | ✅                                                                                                             | `8655c3e5` |
| F-SETORDER       | Layout `change` handler calls `setOrder(undefined)` (follow-up)                                     | R1 Designer      | ✅                                                                                                             | `8655c3e5` |
| F-TEXTUNDO       | Undo of first edit of an empty topic writes the placeholder (follow-up)                             | R2 Undo          | ✅                                                                                                             | `e10d444d` |
| B-SVGICON        | Icon click-to-cycle bypasses undo; descriptive ids fail an assert (3.2)                             | R2 Undo          | ✅                                                                                                             | `e10d444d` |
| F-ICONCMD        | `ChangeFeatureToTopicCommand` throws on icons (`setId`) (follow-up)                                 | R2 Undo          | ✅                                                                                                             | `e10d444d` |
| B-FEATATTR       | Note undo keeps `contentType: html`; dynamic `setAttributes` (3.4)                                  | R2 Undo          | ✅                                                                                                             | `e10d444d` |
| B-GLOBALDESIGNER | Topic/LinkIcon/NoteIcon use the global `designer` (3.2)                                             | R3 Topic         | ✅ connection line, clipboard · ⏳ LinkIcon/NoteIcon/ElementDeleteWidget (BL backlog)                          | `5dc13894` |
| F-NONESHAPE      | Legacy `'image'` shape reports `'none'` and rebuilds every redraw (follow-up)                       | R3 Topic         | ✅                                                                                                             | `5dc13894` |
| F-XOFFSET        | Dead `MainTopic.updatePositionOnChangeSize` xOffset code (follow-up)                                | R3 Topic         | ✅                                                                                                             | `5dc13894` |
| B-DRAGOUT        | Drag stuck when released outside the container / blur; no Escape cancel (3.3)                       | R4 Drag          | ✅                                                                                                             | `18e70a12` |
| B-RESIZE         | `window` resize listener never removed; `registerEvents` not idempotent (3.3)                       | R4 Drag          | ✅                                                                                                             | `18e70a12` |
| B-PIVOTSTATIC    | Static `DragPivot` built at import time, shared across Designers (3.3)                              | R4 Drag          | ✅                                                                                                             | `18e70a12` |
| B-HITSHAPE       | Relationship hit shape invisible after blur; `moveToFront` covers topics (3.3)                      | R5 Relationship  | ✅                                                                                                             | `9bdd1e2a` |
| B-XZERO          | x === 0 family: inconsistent side checks (3.3)                                                      | R5 Relationship  | ✅                                                                                                             | `9bdd1e2a` |
| F-BALSIDE        | `BalancedSorter.predict` first-child branch uses `position.x > 0` (follow-up)                       | R5 Relationship  | ✅                                                                                                             | `9bdd1e2a` |
| F-UNESCAPE       | Plain note `%XX` corrupted by `unescape()` (follow-up)                                              | R6 Persistence   | 🚫 not a bug: Tango notes are always CDATA; unescape only decodes legacy pela/beta attributes (tests pin both) |            |
| B-PELA           | `Pela2TangoMigrator` crashes on maps without positions (3.4)                                        | R6 Persistence   | ✅                                                                                                             | `b5edfd38` |
| B-BETA           | Beta serializer `'icons'`/`'links'` lookups, eager assert (3.4)                                     | R6 Persistence   | ✅ loader + lazy assert (writer unreachable)                                                                   | `b5edfd38` |
| B-FIREFORGET     | `discardChanges`/`unlockMap` fire-and-forget; flush on unload (3.4, follow-up)                      | R6 Persistence   | ✅ mindplot side (editor wiring in backlog)                                                                    | `b5edfd38` |
| B-NANPOS         | NaN position makes a map impossible to open (3.4)                                                   | R6 Persistence   | ✅                                                                                                             | `b5edfd38` |
| F-FMICONS        | FreeMind icons never imported; root notes/icons/links dropped; `'clud'` (3.5, follow-up)            | R7 FreeMind/OPML | ✅                                                                                                             | `3233f604` |
| F-OPMLMULTI      | OPML with several top-level outlines keeps only the first (follow-up)                               | R7 FreeMind/OPML | ✅                                                                                                             | `3233f604` |
| B-DASHFM         | FreeMind relationship line type uses legacy numbering (3.5)                                         | R7 FreeMind/OPML | ✅                                                                                                             | `3233f604` |
| B-IMPESC         | XMind/Freeplane/MindManager XML builders don't escape names/colors or split `]]>` (3.5)             | R8 Importers     | ✅                                                                                                             | `067dc3f6` |
| B-XMDETACHED     | XMind detached topics, `notes.plain.content`, Zen `markers` ignored (3.5)                           | R8 Importers     | ✅                                                                                                             | `067dc3f6` |
| B-MMAP           | MindManager `.mmap` ZIP read as text; letter icons never match (3.5)                                | R8 Importers     | ✅                                                                                                             | `067dc3f6` |
| B-DASH           | Freeplane/MindManager dash styles mapped to `lineType` (3.5)                                        | R8 Importers     | ✅                                                                                                             | `067dc3f6` |
| B-IMPCONTRACT    | Importers return a fallback map the webapp saves as success (3.5)                                   | R8 Importers     | ✅                                                                                                             | `067dc3f6` |
| B-PNGERR         | PNG export hangs on image error; canvas over Safari's limit (3.5)                                   | R9 Export/Theme  | ✅                                                                                                             | `53a49835` |
| B-PDF            | PDF export leaks container, taint, px vs mm (3.5)                                                   | R9 Export/Theme  | ✅                                                                                                             | `53a49835` |
| B-MDNL           | MD export footnotes on one line (3.5)                                                               | R9 Export/Theme  | ✅                                                                                                             | `53a49835` |
| B-PRISM          | Prism always lightens explicit user colors (3.6)                                                    | R9 Export/Theme  | ✅                                                                                                             | `53a49835` |
| B-THEMEID        | Unknown theme id from XML makes the map unopenable (3.6)                                            | R9 Export/Theme  | ✅                                                                                                             | `53a49835` |
| B-EVTMGR         | Unused `EventManager` helpers, `delegate` uses `matches` (3.6)                                      | R9 Export/Theme  | ✅                                                                                                             | `53a49835` |
| F-VIEWONLY       | Story and README use invalid `mode="viewonly"` (follow-up)                                          | R10 Integration  | ✅                                                                                                             | `dabc2a2a` |
| F-SAVEMINOR      | `Editor.save(minor)` passes `minor` as `saveHistory` (follow-up)                                    | R10 Integration  | ✅                                                                                                             | `dabc2a2a` |
| F-TEXTPAIN       | webapp `revertHistory` sends `text/pain` (follow-up)                                                | R10 Integration  | ✅                                                                                                             | `dabc2a2a` |
| F-NOOPENER       | Tooltip links without `rel="noopener"` (follow-up)                                                  | R10 Integration  | ✅                                                                                                             | `dabc2a2a` |
| T1               | `$assert` / `$defined` narrow types (4, step T1)                                                    | Typing           | ✅                                                                                                             | `c3a3ba2a` |
| T2               | Enable `noImplicitAny` (4, step T2)                                                                 | Typing           | ✅                                                                                                             | `3bddfc0f` |

#### Results of round 2 (2026-10-04)

- **42 items:** 39 fixed, 2 partly fixed (B-GLOBALDESIGNER, B-FIREFORGET; their remainders are in the backlog), and 1 not a bug (F-UNESCAPE). T1 and T2 also landed: `noImplicitAny` is on, and 103 errors were fixed with type-only changes.
- **Unit tests:** 74 → 99 suites, 674 → 830 tests. Coverage went from 66.9 / 56.7 / 64.1 / 66.8 to **72.9 / 62.2 / 70.3 / 72.9**, and the threshold was raised to 72/62/70/72.
- **`tsc`:** 0 errors for mindplot, editor, webapp and web2d. ESLint is clean.
- **Cypress on `develop`:**
  - mindplot: all specs pass.
  - editor playground: 139 passed, 5 skipped.
  - editor Storybook smoke: 41 of 43 pass. The 2 KeyboardShortcutHelp failures already happen on `be462e6a`, before this work (BL backlog).
- **One merge conflict**, between R7 and R8 in `OPMLImporter.ts`. It was resolved by keeping R7's multi-outline central topic and R8's rejection in place of the fallback map.
- **Behaviour changes to be aware of:**
  - Importers now reject with `ImportError` instead of returning a fallback map, and the webapp import dialog shows the error.
  - Relationships render below topics, with a clickable hit area.
  - A topic at x = 0 counts as the right side.
  - Prism light maps no longer lighten palette colours.
  - Pasting several topics under the root keeps them on one side.
  - The image snapshots from `docker-compose.snapshots.yml` were not run, so they may need updating.
- **Backlog for round 3:** 75 items (below).

### Backlog (round 3): follow-ups found during round 2

Every follow-up an agent reports is added here as a new item to process.

| ID    | Item                                                                                                                                                                                                                          | Found in                                                          | Status | Commit |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------ | ------ |
| BL-01 | mindplot README example uses `<mindmap-comp>`; the element is `mindplot-component`                                                                                                                                            | R10                                                               | ⏳     |        |
| BL-02 | mindplot README typos and a 3-arg `LocalStorageManager` call (the constructor takes 4)                                                                                                                                        | R10                                                               | ⏳     |        |
| BL-03 | editor `Editor.registerEvents` adds a `beforeunload` listener that is never removed (`editor/src/classes/model/editor/index.ts:124`)                                                                                          | R10                                                               | ⏳     |        |
| BL-04 | MD export: multi-line topic text breaks the list item (`export/MDExporter.ts:83-85`, see `expected/enc.md:130-132`)                                                                                                           | R9                                                                | ⏳     |        |
| BL-05 | Prism light maps no longer lighten palette colors (B-PRISM): check the Prism Cypress image snapshots (`connection.test.js`, `storybook-regression.test.js`)                                                                   | R9                                                                | ⏳     |        |
| BL-06 | `XMLSerializerTango.ts:374-378` casts the theme attribute `as ThemeType` without validation (ThemeFactory now tolerates unknown ids)                                                                                          | R9                                                                | ⏳     |        |
| BL-07 | `PrismTheme.getBorderColor` doesn't use the connection color for line-shaped topics, unlike `DefaultTheme` (check)                                                                                                            | R9                                                                | ⏳     |        |
| BL-08 | PDF export drops the original error cause in its catch                                                                                                                                                                        | R9                                                                | ⏳     |        |
| BL-09 | `test/unit/export/ImageExporterFactoryTestSuite.test.ts` fails `prettier --check`                                                                                                                                             | R9                                                                | ⏳     |        |
| BL-10 | Remove the last global `designer` reads: pass the Designer in `NodeOption` (`Designer._buildNodeGraph` ~283), use it in `LinkIcon`/`NoteIcon`, and in `ElementDeleteWidget.show` once `IconGroup` remembers `remove` per icon | R3                                                                | ⏳     |        |
| BL-11 | `IconGroup._setupDeleteWidgetsForExistingIcons` (206-215) adds delete widgets to icons added with `remove=false`, including on read-only topics                                                                               | R3                                                                | ⏳     |        |
| BL-12 | `ElementDeleteWidget` is a single instance shared by every Designer on the page                                                                                                                                               | R3                                                                | ⏳     |        |
| BL-13 | `Topic.setSize`: a NaN/infinite measured size makes `hasSizeChanged` true on every redraw (NaN !== NaN)                                                                                                                       | R3                                                                | ⏳     |        |
| BL-14 | `LinkModel` still uses the dynamic `set<Key>` fallback; add an explicit `applyAttribute` (url, urlType) and drop the fallback                                                                                                 | R2                                                                | ⏳     |        |
| BL-15 | `EmojiCharIcon` constructor typed `SvgIconModel` but receives `EmojiIconModel`; it doesn't register `setChangeListener`, so an eicon change doesn't redraw the glyph                                                          | R2                                                                | ⏳     |        |
| BL-16 | `SvgImageIcon`'s module-level `import.meta.glob` makes it unimportable under jest; move the glob into its own module                                                                                                          | R2                                                                | ⏳     |        |
| BL-17 | `INodeModel.getText()` returns `string                                                                                                                                                                                        | null`while setters use`undefined`                                 | R2     | ⏳     |     |
| BL-18 | `test/unit/commands/designer-harness.ts` passes `{}` as widget manager, so maps with notes/links throw                                                                                                                        | R2                                                                | ⏳     |        |
| BL-19 | FreeMind import maps `<edge COLOR>` to background color, overwriting BACKGROUND_COLOR (`FreemindImporter.ts:~286`)                                                                                                            | R7                                                                | ⏳     |        |
| BL-20 | FreeMind richcontent notes that are effectively empty (`<p></p>`) are imported as empty HTML notes                                                                                                                            | R7                                                                | ⏳     |        |
| BL-21 | FreeMind export drops emoji icons; map them back to FreeMind builtins (`FreemindExporter.ts:~268`)                                                                                                                            | R7                                                                | ⏳     |        |
| BL-22 | Leftover `console.log` in `freemind/Map.loadFromDom` (Map.ts:88)                                                                                                                                                              | R7                                                                | ⏳     |        |
| BL-23 | `freemind/Map.nodeToXml` returns `parentNode` for unknown types, so callers append the parent to itself                                                                                                                       | R7                                                                | ⏳     |        |
| BL-24 | `Relationship.ts:62,85` ignores the model's `lineType` when rendering (always THIN_CURVED)                                                                                                                                    | R7                                                                | ⏳     |        |
| BL-25 | Legacy WiseMapping icon ids in imported files (`face_surprise`, `bulb_light_on`…) are no longer in SvgIconFamily.json and are dropped; add a legacy→emoji map                                                                 | R7                                                                | ⏳     |        |
| BL-26 | Unused FreeMind fixtures `test/unit/import/input/freemind/*.mm` with non-builtin icon ids                                                                                                                                     | R7                                                                | ⏳     |        |
| BL-27 | `DragTopic.ts:80` should use `sideOf` from `util/side.ts` (if R4 did not)                                                                                                                                                     | R5                                                                | ⏳     |        |
| BL-28 | `DesignerKeyboard`: `_goToSideChild` (451-452) excludes a child at x=0 from both sides; `_goToChild` (489) counts it on both                                                                                                  | R5                                                                | ⏳     |        |
| BL-29 | `SymmetricSorter.predict(!node)` on an isolated root compares the root with itself; the add-child preview disagrees with the layout for roots at x<0                                                                          | R5                                                                | ⏳     |        |
| BL-30 | `DragConnector.ts:67` `xMouseGap` is dead code                                                                                                                                                                                | R5                                                                | ⏳     |        |
| BL-31 | x===0 handled inconsistently in `Beta2PelaMigrator:56`, `Pela2TangoMigrator:57`, `OPMLImporter:134`, `FreemindImporter:173,178,480`, `ArcLine:43-53`; use `sideOf`                                                            | R5                                                                | ⏳     |        |
| BL-32 | Relationships now render below topics with a visible hit shape: check the Cypress image snapshots                                                                                                                             | R5                                                                | ⏳     |        |
| BL-33 | Remove the order save/restore workaround in `DeleteCommand.ts:98-115` (no longer needed after F-SETORDER)                                                                                                                     | R1                                                                | ⏳     |        |
| BL-34 | Adding/pasting a child into a collapsed parent takes two undo steps (`shrinkBranch` + `addTopics`); make `AddTopicCommand` restore the shrink state                                                                           | R1                                                                | ⏳     |        |
| BL-35 | Paste under the root keeps the group on one side; spreading across sides needs prediction per insert inside `AddTopicCommand` (decide)                                                                                        | R1                                                                | ⏳     |        |
| BL-36 | `DesignerKeyboard.pause/resume` is a boolean, not a counter: nested pauses (editor `action-widget/input`) re-enable shortcuts while a pane is open                                                                            | R1                                                                | ⏳     |        |
| BL-37 | `DesignerKeyboard.register()` resets `_disabled`, losing a `pause()` from `useEditor` that ran before                                                                                                                         | R1                                                                | ⏳     |        |
| BL-38 | Process: lint-staged's pre-commit backup uses the shared `git stash` across worktrees                                                                                                                                         | R1                                                                | ⏳     |        |
| BL-39 | editor `flushPendingChanges` must call `component.save(false, { urgent: true })`, and send `unlockMap()` immediately on `beforeunload` (`editor/.../editor/index.ts:152,158`)                                                 | R6                                                                | ⏳     |        |
| BL-40 | editor `BootstrapPersistenceManager.saveMapXml` doesn't forward the new `options` (`urgent`) argument                                                                                                                         | R6                                                                | ⏳     |        |
| BL-41 | Beta `_deserializeNote` doesn't decode escape()-encoded legacy notes (show `%20`)                                                                                                                                             | R6                                                                | ⏳     |        |
| BL-42 | Dead Beta writer: `'icons'`/`'links'` lookups (`XMLSerializerBeta.ts:126,133`); remove or fix                                                                                                                                 | R6                                                                | ⏳     |        |
| BL-43 | `Pela2TangoMigrator` throws on a pela map with no central topic                                                                                                                                                               | R6                                                                | ⏳     |        |
| BL-44 | A non-central model without a position crashes rendering (`layout/Node.ts:191`); `Designer.ts:734`, `:417` dereference `getPosition()` unchecked                                                                              | R6                                                                | ⏳     |        |
| BL-45 | `XMLSerializerTango._readCDATA` ignores plain-text note content (check older backend writers)                                                                                                                                 | R6                                                                | ⏳     |        |
| BL-46 | keepalive + CORS preflight on cross-origin API_URL is browser-dependent; verify in staging                                                                                                                                    | R6                                                                | ⏳     |        |
| BL-47 | `Designer.applyLayout` (1077-1079) resets the deprecated static `DragTopic._dragPivot`; use `this._dragManager?.getDragPivot()` and remove the getter                                                                         | R4                                                                | ⏳     |        |
| BL-48 | Designer dispose: call `Canvas.dispose()`, remove `EventBusDispatcher.registerBusEvents` listeners and `globalThis.designer` (Phase 3)                                                                                        | R4                                                                | ⏳     |        |
| BL-49 | `Designer` `enddragging` handler should check `dragTopic.isCancelled()` explicitly                                                                                                                                            | R4                                                                | ⏳     |        |
| BL-50 | `Canvas` mousedown during a pan ends it as a release (can fire click)                                                                                                                                                         | R4                                                                | ⏳     |        |
| BL-51 | `DragConnector.ts:50` uses `x > 0`; apply `sideOf`                                                                                                                                                                            | R4                                                                | ⏳     |        |
| BL-52 | Relationship control points have no Escape cancel                                                                                                                                                                             | R4                                                                | ⏳     |        |
| BL-53 | Beta loader: `setFontSize` receives a string (`XMLSerializerBeta.ts:~267`); its error message reads `Document.innerHTML` (always undefined, ~194); a `<link>` without url makes `LinkModel.setUrl` assert (~331)              | T                                                                 | ⏳     |        |
| BL-54 | `PersistenceManager.save` catch passes a raw `Error` to `onError(PersistenceError)` (63-65)                                                                                                                                   | T                                                                 | ⏳     |        |
| BL-55 | `GridSorter.predict()` throws "not implemented": dragging in a grid layout would throw (check if reachable)                                                                                                                   | T                                                                 | ⏳     |        |
| BL-56 | `DragManager` calls the `startdragging`/`enddragging` listeners without a null check (136, 188)                                                                                                                               | T                                                                 | ⏳     |        |
| BL-57 | editor: type `BootstrapPersistenceManager` events as `SaveEvents`; `default-widget-manager` should accept `string                                                                                                             | undefined`from`getLinkValue`; then narrow the mindplot types back | T      | ⏳     |     |
| BL-58 | editor and webapp tsconfig still have `noImplicitAny: false`                                                                                                                                                                  | T                                                                 | ⏳     |        |
| BL-59 | `FreemindImporter` and `WisemappingImporter` `import()` throw synchronously; reject with `ImportError` and drop `TextImporterFactory.rejectWithImportError`                                                                   | R8                                                                | ⏳     |        |
| BL-60 | Export `ImportError` from mindplot and editor `index.ts` so the webapp can use `instanceof`                                                                                                                                   | R8                                                                | ⏳     |        |
| BL-61 | Freeplane dash mapping (`3 3`→dashed, `5 5`→dotted) may not match Freeplane's DashVariant (`3 3` = CLOSE_DOTS, `7 7` = DASHES)                                                                                                | R8                                                                | ⏳     |        |
| BL-62 | Freeplane note HTML is saved without `contentType=html` and without sanitizing                                                                                                                                                | R8                                                                | ⏳     |        |
| BL-63 | XMind, Freeplane, MindManager: the central topic's notes, icons and links are dropped                                                                                                                                         | R8                                                                | ⏳     |        |
| BL-64 | XMind: topic links (`href`/`xlink:href`) and relationship control points are not imported                                                                                                                                     | R8                                                                | ⏳     |        |
| BL-65 | MindManager real schema: icons (`IconsGroup`), colors (`Color@FillColor`) and `FloatingTopics` not mapped; validate with a real .mmap sample                                                                                  | R8                                                                | ⏳     |        |
| BL-66 | MindManager `parseTopic`: `generateId()` for topics without id can collide with real ids in `topicIdMap`                                                                                                                      | R8                                                                | ⏳     |        |
| BL-67 | `SecureXmlParser.MAX_XML_NODES = 10000` can reject large valid maps                                                                                                                                                           | R8                                                                | ⏳     |        |
| BL-68 | `FreeplaneIconMappingTest` / `XMindIconMappingTest` not Prettier-formatted                                                                                                                                                    | R8                                                                | ⏳     |        |
| BL-69 | web2d `CurvedLinePeer.set*ControlPoint` always sets the custom flag, so every relationship acts hand-shaped after load and doesn't follow moved topics (H, confirmed); fix in web2d together with mindplot `Relationship.ts`  | web2d                                                             | ⏳     |        |
| BL-70 | Saved relationship control points are never applied on load since `62a4510c` (confirm, mindplot `Relationship`)                                                                                                               | web2d                                                             | ⏳     |        |
| BL-71 | web2d rounds the viewBox while mindplot keeps exact values: slow pans don't move, pan jumps, mouse mapping off by up to half a unit (see WEB2D_REVIEW_PLAN.md)                                                                | web2d                                                             | ⏳     |        |
| BL-72 | editor `stories-smoke.cy.ts` › KeyboardShortcutHelp: 2 tests fail (6 elements where 2 expected; 9 key caps vs 10). Already failing on `be462e6a` before this work, after the shortcut tabs change (`f10e14c3`, `ca179c73`)    | Cypress                                                           | ⏳     |        |
| BL-73 | Beta loader passes font size as a string (`XMLSerializerBeta.ts:265`); `XMLSerializerFactory` BETA migrator is not a constructor (37)                                                                                         | T                                                                 | ⏳     |        |
| BL-74 | `NodeGraph.ts:162` `buildDragShape()!`: CentralTopic has no drag shape                                                                                                                                                        | T                                                                 | ⏳     |        |
| BL-75 | `INodeModel.getPosition` is typed `PositionType` but returns undefined when unset (130)                                                                                                                                       | T                                                                 | ⏳     |        |

---

## 1. Baseline

| Metric                                          | Value                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `tsc --noEmit` (current config)                 | 0 errors                                                                        |
| ESLint                                          | clean                                                                           |
| `strict`                                        | on, but `noImplicitAny: false`                                                  |
| Errors if `noImplicitAny` is enabled            | ~79–85 in `src` (42 × TS7006, 16 × TS7053, 7 × TS7016 for lodash with no types) |
| Errors if `noImplicitOverride` is enabled       | 48                                                                              |
| Errors if `noUncheckedIndexedAccess` is enabled | 209                                                                             |
| `$assert` / `$defined` calls                    | 204 / 68 (318 including imports), and neither one narrows types                 |
| `!` non-null assertions                         | ~99                                                                             |
| `@ts-ignore`                                    | 3 (`EventDispatcher.ts` ×2, `Designer.ts:622`)                                  |
| Unit tests                                      | 33 suites, 355 tests, all passing                                               |
| Unit-test coverage                              | **38.1 % statements, 33.9 % branches, 34.7 % functions, 37.8 % lines**          |

The package compiles cleanly, but only because the type system is configured not to look closely. Most typing debt sits behind `any` from the event bus, untyped `getProperty` bags, and asserts that don't narrow, not in visible errors. Several of the bugs below would have been compile errors with better types. For example:

- `findNodeById` returns `any`, which hides a `!== null` check against `undefined`.
- Locale bundles are untyped, which hides missing keys.
- `'icons'` is passed where `'icon'` is expected.

---

## 2. Fix first: security and data loss

These have the highest impact. Each one is small and should land together with a regression test.

| #   | Sev | Where                                                                         | Problem                                                                                                                                                                                                                                                                                                                                                                                                     | Fix                                                                                                                                                                         |
| --- | --- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | H   | `security/HtmlSanitizer.ts:231-238`                                           | **The sanitizer can be bypassed.** When it meets a disallowed tag, it moves the children into a `<span>` and returns without sanitizing them. `<font><img onerror=…></font>` survives intact. It also parses with `innerHTML` on the live document, so `onerror` fires _during_ sanitization. Reached from the Freemind and OPML importers, so a crafted `.mm` or `.opml` file gives stored XSS.            | Recurse into the new span. Parse with `DOMParser`, which produces an inert document, or adopt DOMPurify.                                                                    |
| S2  | H   | `WidgetBuilder.ts:119-141`, `util/DOMUtils.ts:52`, `model/LinkModel.ts:42-52` | **Link and note tooltips use `innerHTML`.** Note HTML and link URLs from the map XML are injected without sanitizing. `_fixUrl` accepts `javascript:alert(1)//http://x` because it only checks `includes('http://')`. A shared or public map can run script on hover.                                                                                                                                       | Use `textContent` for the URL and title, run notes through the fixed sanitizer, and validate URLs with `new URL()` against an allowlist of `http:`, `https:` and `mailto:`. |
| S3  | H   | `model/NoteModel.ts:46-52`, `model/INodeModel.ts:98-110`                      | **`getPlainText()` assigns `innerHTML` on a detached div.** `<img onerror>` still fires there. It is called from search, TXT/MD export and the outline view.                                                                                                                                                                                                                                                | `new DOMParser().parseFromString(html, 'text/html').body.textContent`.                                                                                                      |
| S4  | H   | `export/TxtExporter.ts:68-71`, `export/MDExporter.ts:94-95`                   | **Inverted ternary.** HTML notes are exported as raw markup, and plain notes are sent through `getPlainText()`, which is the S3 sink.                                                                                                                                                                                                                                                                       | Swap the branches.                                                                                                                                                          |
| D1  | H   | `persistence/XMLSerializerTango.ts:730-746`                                   | **Saving strips every emoji and astral character.** `_rmXmlInv` iterates `charCodeAt`, so `c >= 0x10000` is never true, and surrogate halves are dropped. `'Hi 😀'` is saved as `'Hi '`.                                                                                                                                                                                                                    | Replace the loop with one regex using the `u` flag. This is also faster.                                                                                                    |
| D2  | H   | `persistence/XMLSerializerTango.ts:281,305`                                   | **A note or text containing `]]>` makes the map unsaveable.** `createCDATASection` throws, and `toXML` runs outside the `try`.                                                                                                                                                                                                                                                                              | Split on `]]>` (`]]]]><![CDATA[>`).                                                                                                                                         |
| D3  | H   | `RestPersistenceManager.ts:50-98`                                             | **Saves are silently dropped.** The `throttle` uses `{leading: true, trailing: false}`, so a second save within 10 s is discarded and its promise never settles. `flushPendingChanges` and `unlockMap` then hang, and the last edits are lost.                                                                                                                                                              | Remove the throttle. Serialize saves (one in flight, coalesce the most recent one) and settle every caller.                                                                 |
| D4  | H   | `MindplotWebComponent.ts:236-241`                                             | **An edit made while a save is in flight is lost.** `onSuccess` clears the dirty flag even if the model changed after it was serialized.                                                                                                                                                                                                                                                                    | Keep a revision counter, and clear dirty only when `rev === capturedRev`.                                                                                                   |
| D5  | H   | `commands/DeleteCommand.ts:79-82,105,113`                                     | **Undoing a delete loses topics.** Three causes: (a) `_parentTopicIds` falls out of step with the models when a floating topic is deleted; (b) `if (parentId)` is false for the central topic, whose id is `0`, so undoing the delete of a first-level topic turns it into a floating topic; (c) restored floating topics are never added to `mindmap.addBranch`, so they are **dropped on the next save**. | Always push `id ?? null`, test with `!= null`, and call `addTopic` for parentless topics.                                                                                   |
| D6  | M   | `persistence/XMLSerializerTango.ts:87-90`                                     | The dangling-relationship guard compares `findNodeById(...) !== null`, but the function returns `undefined`. Relationships to deleted nodes are written to the file and then fail on load.                                                                                                                                                                                                                  | `!= null`, and type the return as `NodeModel \| undefined`.                                                                                                                 |
| D7  | M   | `security/SecureXmlParser.ts:89-96`                                           | Every import strips **all** named entities, including `&amp; &lt; &gt; &quot; &apos;`, so "R&amp;D" becomes "RD". The comment and processing-instruction regexes also corrupt CDATA. `MAX_XML_NODES = 10000` rejects large legitimate maps. `DOMParser` never resolves external entities, so these regexes add no XXE protection.                                                                           | Reject `<!DOCTYPE` and drop the regexes. Raise the node cap or make it configurable.                                                                                        |
| D8  | M   | `RestPersistenceManager.ts:128-134,167`                                       | `response.headers['Content-Type']` is always `undefined`, so the code always runs `JSON.parse`, which throws on an HTML 502 page. Loaded XML is never checked for `<parsererror>`, so a partially parsed map is loaded and autosave can overwrite the server copy with the truncated version.                                                                                                               | `headers.get(...)`, a `try` around the parse, and a `parsererror` check.                                                                                                    |

---

## 3. Bugs by area

### 3.1 Designer, commands and undo

| Sev | Where                                               | Problem                                                                                                                                                                                                                                                      |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| H   | `DesignerUndoManager.ts:36-47`                      | Undo merging replaces the last command whenever the `discardDuplicated` key matches, without checking that the target topics match. Coloring A and then B makes A's change impossible to undo. Black→red→green, then undo, gives red.                        |
| H   | `StandaloneActionDispatcher.ts:165,178,192,282`     | The color commands save the **theme-resolved** color as the old value. After undo, the topic has a hard-coded override and no longer follows theme or variant changes. Save `topic.getModel().getXxxColor()` instead.                                        |
| H   | `Designer.ts:491-514`                               | `zoomToFit` uses the opposite zoom convention from `Canvas.setZoom` and `zoomIn`. For content larger than the viewport, panning, clicks and the next zoom are off by 1/zoom². It also measures `.MuiAppBar-root`; a canvas library should not depend on MUI. |
| H*  | `Designer.ts:902`                                   | Siblings are created at `order + 1`. Under `BalancedSorter`, parity encodes the side, so Enter on a first-level topic puts its sibling on the **opposite** side. (_likely_)                                                                                  |
| M   | `commands/GenericFunctionCommand.ts:47-66`          | Old values are stored by position in the array, not by topic id. After a delete and undo changes the order, undo swaps values between topics. Use `Map<id, T>`.                                                                                              |
| M   | `StandaloneActionDispatcher.ts:384-387`             | Undoing a shrink assumes `!isShrink`. Undoing collapse-all or expand-all also toggles branches that were already in that state.                                                                                                                              |
| M   | `commands/GenericRelationshipFunctionCommand.ts:25` | Holds `Relationship` object references. After a delete and undo, the objects are rebuilt, and undoing an earlier style change edits detached objects. Store ids instead.                                                                                     |
| M   | `commands/AddFeatureToTopicCommand.ts:54-58`        | One `FeatureModel` instance is shared by every selected topic, so editing the note on one topic edits it on all of them.                                                                                                                                     |
| M   | `Designer.ts:254-258` + `DesignerModel.ts:105`      | `DragManager` captures `getTopics()` once, and `removeTopic` replaces the array. After the first delete, drag operations work on a stale list.                                                                                                               |
| M   | `Designer.ts:775-801,839`                           | Paste-as-child: every clone gets the same predicted order, so siblings end up reversed. An empty clipboard still pushes an undo step. `_createChildModel` expands the parent outside the command.                                                            |
| M   | `Designer.ts:1461-1485`                             | The recursive `removeTopic` calls `goToNode` on each deleted descendant, so the viewport jumps and selection events fire for nodes being deleted.                                                                                                            |
| M   | `DesignerBuilder.ts:23-30`                          | Module-level singleton with no dispose. A second `buildDesigner` throws, and the container, document and `LayoutEventBus` listeners leak, along with `globalThis.designer`.                                                                                  |
| M   | `DesignerKeyboard.ts:198-206`                       | A single static `_disabled` flag is shared between mouse hover and dialogs. Hovering the canvas while a dialog is open re-enables Delete and Backspace behind it.                                                                                            |
| L   | `MindplotWebComponent.ts:156`                       | The default mode is `'viewonly'`, which is not a valid `EditorRenderMode`, so a component without the attribute is **editable**.                                                                                                                             |
| L   | `DesignerActionRunner.ts:52-62`                     | Undo and redo on an empty stack still fire `modelUpdate`, which marks the map dirty and triggers autosave and a full layout.                                                                                                                                 |
| L   | `MindplotWebComponent.ts:253-261`                   | `unlockMap` dereferences the mindmap before its null check.                                                                                                                                                                                                  |
| L   | `EventDispatcher.ts:51-53`                          | Falsy payloads (`0`, `false`, `''`) are dropped. Iterating the live array skips the next handler when one handler removes itself.                                                                                                                            |

### 3.2 Topics, icons, text editor, selection overlay

| Sev | Where                                                        | Problem                                                                                                                                                                                                                                                          |
| --- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H   | `shape/LineTopicShape.ts:27`                                 | `super(shape, 'image')` should be `'line'`. Every redraw of a line-shaped topic, which is most topics because every theme uses `line` for deeper levels, rebuilds the inner shape and **redraws the whole subtree**. One-line fix, and a large performance gain. |
| H   | `HTMLTopicSelected.ts:188-196`                               | An extra `mousedown` listener calls `onObjectFocusEvent(topic)` without the event, so Cmd or Ctrl-clicking a selected topic deselects everything else.                                                                                                           |
| H   | `ImageEmojiFeature.ts:195-204`, `ImageSVGFeature.ts:669-680` | A delete-widget is set up on every redraw with a new `Icon` object, so de-duplication never matches. Hover listeners grow without bound.                                                                                                                         |
| H   | `ImageEmojiFeature.ts:60-62`                                 | Changing emoji A→B leaves the old `<text>` in the SVG, so the two glyphs overlap.                                                                                                                                                                                |
| M   | `Topic.ts:1058-1070` + `NodeGraph.ts:116`                    | In `setSize`, `oldSize` aliases the live `_size`, so `updatePositionOnChangeSize` never re-centers. Comparing a `ceil`ed value with an unrounded one makes `topicResize` fire on every redraw.                                                                   |
| M   | `Topic.ts:854-856`                                           | `setLinkValue(undefined)` on a topic with no link fails with `links[0].getId()`.                                                                                                                                                                                 |
| M   | `Topic.ts:820-833`                                           | Clearing an empty note creates a blank `' '` note.                                                                                                                                                                                                               |
| M   | `MultilineTextEditor.ts:50,306`                              | Pressing Esc on an untitled topic writes the localized placeholder ("Main Topic") into the model, outside undo.                                                                                                                                                  |
| M*  | `MultilineTextEditor.ts:89-143`                              | No `isComposing` guard, so Enter during IME composition (zh, ja, ko) commits. `keypress` misses paste and backspace, so the text is clipped. Listen to `input` instead.                                                                                          |
| M*  | `CentralTopic.ts:61-63`                                      | `updateTopicShape` returns `true` without calling `super`. Shape changes on the central topic aren't applied, and every central redraw redraws the whole map.                                                                                                    |
| M   | `SvgImageIcon.ts:88-95,136`                                  | Clicking an icon to cycle it bypasses ActionDispatcher, so there is no undo and no dirty flag. Descriptive icon ids fail an `$assert`.                                                                                                                           |
| M   | `HTMLTopicSelected.ts:1193-1224,177-196`                     | Ten `LayoutEventBus` handlers are never removed. `dispose()` leaves the topic listeners in place, which leaks earlier Designers.                                                                                                                                 |
| M*  | `Topic.ts:1259`, `LinkIcon.ts:52`, `NoteIcon.ts:51`          | These use the global `designer`. With two editors on one page, connections are drawn into the wrong workspace.                                                                                                                                                   |
| L   | `HTMLTopicSelected.ts:694-701`                               | The hover closures capture the first colors, so hover is stale after a theme change.                                                                                                                                                                             |
| L   | `IconGroup.ts:28-31,58-60`                                   | `ORDER_BY_TYPE` has no `'eicon'` entry, so the sort compares NaN. `_iconSize` is set to null right after it is set.                                                                                                                                              |

### 3.3 Layout, drag, canvas, relationships

| Sev | Where                                                                                                                               | Problem                                                                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H   | `Canvas.ts:380-383`                                                                                                                 | The touch listeners are removed with the handlers swapped. They pile up on every pan, and stale closures make the canvas jump.                                                                                |
| H   | `Canvas.ts:321-331`                                                                                                                 | A pinch gesture disables workspace events and returns without re-enabling them, which kills all panning and dragging.                                                                                         |
| H   | `layout/SymmetricSorter.ts:135-138`                                                                                                 | Off by one when a topic is dropped from a _different_ parent: the preview shows it between siblings, and the drop lands one slot higher. Reproduced.                                                          |
| H   | `layout/BalancedSorter.ts:80-88`                                                                                                    | `predict` ignores the shift `detach` causes, so dragging a root child downward on its own side lands one slot too low. Reproduced.                                                                            |
| M   | `layout/TreeSorter.ts:64-97`                                                                                                        | Mixes the order computed over all siblings with indexes into the filtered list. The pivot is drawn past the last child. Reproduced.                                                                           |
| H*  | `layout/EventBusDispatcher.ts`, `layout/LayoutEventBus.ts:46`                                                                       | The global singleton bus is never reset. Handlers from earlier Designers keep firing, and a throw in one of them (`RootedTreeSet.add`: "node already exits") stops later handlers. Make the bus per Designer. |
| M   | `DragManager.ts:83-87`, `RelationshipControlPoints.ts:103`, `Canvas.ts:375-398`                                                     | Move and up handlers are bound to the container. Releasing outside it, or a window blur, leaves the drag stuck, and there is no Escape cancel. Use pointer capture.                                           |
| M   | `Canvas.ts:89-98`                                                                                                                   | The `window` resize listener is never removed. `registerEvents` is not idempotent, so a second `loadMap` breaks panning.                                                                                      |
| M   | `ScreenManager.ts:131-133,193-198`                                                                                                  | Mixes `clientX` with `window.scrollX`. Coordinates are off on scrolled host pages, which affects embedders.                                                                                                   |
| M   | `Relationship.ts:597`                                                                                                               | `setDestControlPoint` calls `_focusShape.setSrcControlPoint`, a copy-paste error.                                                                                                                             |
| M*  | `Relationship.ts:88-99,220-284`                                                                                                     | The hit shape becomes invisible after the first blur. `redraw()` calls `moveToFront()`, so relationships cover topics and steal their clicks.                                                                 |
| M   | `layout/SymmetricSorter.ts:324`, `TopicConnection.ts:265`, `DragConnector.ts:102`, `DragTopic.ts:80`, `layout/BalancedSorter.ts:52` | The **x === 0 family**, the same class of bug as `7aaad54e`: `Math.sign(0)` and `>` vs `>=` are used inconsistently. Introduce a single `sideOf(x): 1 \| -1` helper.                                          |
| L   | `DragTopic.ts:43`                                                                                                                   | A static `DragPivot` builds SVG at import time and is shared across Designers.                                                                                                                                |
| L   | `layout/BalancedSorter.ts:213-230`                                                                                                  | `verify` never checks the left side, and its odd-order formula is wrong.                                                                                                                                      |
| L   | `RelationshipControlPoints.ts:186`, `Relationship.ts:126,135`, `RelationshipPivot.ts:138,214`                                       | A click with no drag creates an undo entry. The control-point object is built twice. A throttle drops the last mousemove. A leftover `console.log`.                                                           |

### 3.4 Model and persistence (in addition to section 2)

| Sev | Where                                                          | Problem                                                                                                                           |
| --- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| M*  | `persistence/Pela2TangoMigrator.ts:56-82`                      | `_fixOrder` dereferences positions before `_fixPosition` fills them in, so old maps crash.                                        |
| M*  | `model/INodeModel.ts:39-40,112-123`                            | Positions are stored as the string `{x:…,y:…}` and parsed with a regex plus `JSON.parse`. A NaN makes the map impossible to open. |
| M*  | `RestPersistenceManager.ts:111-126`                            | `discardChanges` and `unlockMap` are fire-and-forget, with no `keepalive` and no `ok` check.                                      |
| L   | `XMLSerializerTango.ts:535`, `XMLSerializerBeta.ts:246`        | `shrink="false"` is read as true (`Boolean("false")`).                                                                            |
| L   | `model/FeatureModel.ts:55-61`                                  | Undoing a note edit leaves `contentType: html`. `setAttributes` calls `this['set'+key]` dynamically.                              |
| L   | `model/LinkModel.ts:47`                                        | `mailto:` links get an `http://` prefix.                                                                                          |
| L   | `LocalStorageManager.ts:42-49`, `MockPersistenceManager.ts:31` | `save()` never settles. The full map XML is logged with `console.log` on every save.                                              |
| L   | `persistence/XMLSerializerBeta.ts:126-190`                     | Looks up `'icons'` and `'links'`, which never match. An eager `$assert` message throws on an empty `<map/>`.                      |

### 3.5 Import and export

Several committed snapshots lock in broken output, including `opml.wxml`, `opml-simple.wxml`, `Cs2.wxml`, `bug3.wxml`, `bug3.mm`, `enc.mm`, `complex.md` and three XMind error maps. They must be regenerated together with the fixes.

| Sev | Where                                                                                                             | Problem                                                                                                                                                                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H   | `import/OPMLImporter.ts:58`                                                                                       | `createFromDocument(opmlDoc)` reads `version="1.0"` and throws, so **every OPML import fails**. The fallback produces FreeMind syntax. Use `createFromMindmap`.                                                                 |
| H   | `export/FreeplaneExporter.ts:29-39`                                                                               | TODO stub: it exports a hard-coded two-node map. The option is offered in the webapp export dialog. Implement it or hide it.                                                                                                    |
| H   | `export/freemind/importer/VersionNumber.ts:31`                                                                    | `isGreaterThan` returns `compareTo < 0`, so every FreeMind map **older** than 1.0.1 is rejected.                                                                                                                                |
| H   | `import/FreemindImporter.ts:114-135,353-360`                                                                      | Arrowlinks that point forward are dropped (6 → 0 in `writing_an_essay_with.mm`). Every surviving relationship is duplicated because the code pushes into the live array. `fixRelationshipControlPoints` never matches anything. |
| H   | `import/XMindImporter.ts:658`                                                                                     | `querySelector('[local-name()="title"]')` is not valid CSS and throws, so **XML-format XMind import always falls back** when a relationship has no title.                                                                       |
| H   | `import/XMindImporter.ts:468-816`, `import/FreeplaneImporter.ts:103,141`, `import/MindManagerImporter.ts:284-304` | Descendant selectors (`querySelectorAll('icon')`, `notes > plain` and others) copy children's icons and notes onto every ancestor: 16 markers become 28. Use `:scope >` or a helper that only looks at direct children.         |
| H   | `export/FreemindExporter.ts:226-236,67`                                                                           | `<p>${text}</p>` is built without escaping and parsed as XML with the parse-error check disabled. `<parsererror>` ends up inside the exported `.mm`.                                                                            |
| M   | `export/FreemindExporter.ts:331-348,303-311,267-275`                                                              | `rgbToHex` concatenates decimal values (`#2550128`). Any font weight exports as BOLD. Border color is exported as edge color, which is imported back as background color.                                                       |
| M   | `import/FreemindImporter.ts:266`                                                                                  | `depth++` passes the parent's depth to the child. Use `depth + 1`.                                                                                                                                                              |
| M   | `import/FreemindImporter.ts:229-312`                                                                              | Features that appear after a child `<node>` are attached to the previous sibling.                                                                                                                                               |
| M   | `export/freemind/Map.ts:96-125`, `import/FreemindIconConverter.ts:22-26`                                          | Notes and icons on the root are dropped. `'clud'` is a typo for `cloud`. `freeIdToIcon` is never populated, so **every FreeMind icon is lost**.                                                                                 |
| M   | Import XML builders (XMind, Freeplane, MindManager)                                                               | `nameMap` and colors are inserted without escaping, and CDATA isn't split on `]]>`. Build a `Mindmap` model and serialize it, as OPML and Freemind already do.                                                                  |
| M*  | `import/XMindImporter.ts:74-91,699,754`                                                                           | Detached topics, `notes.plain.content` and Zen `markers` are ignored. There are incorrect emoji mappings.                                                                                                                       |
| M   | All importers                                                                                                     | Some catch errors and return a "fallback map" that the webapp saves as if it were a success. Others throw. Use one async contract with a typed `ImportError`.                                                                   |
| M*  | `import/MindManagerImporter.ts:237,114-158`                                                                       | Real `.mmap` files are ZIP archives, but they are read as text. Letter icons never match because of a case mismatch.                                                                                                            |
| M*  | `export/BinaryImageExporter.ts:81-100`                                                                            | No `onerror`, so the promise hangs. The canvas can exceed Safari's ~16.7 MP limit and produce a blank PNG.                                                                                                                      |
| L   | `import/FreeplaneImporter.ts:547`, `import/MindManagerImporter.ts:363`, `import/FreemindImporter.ts:399`          | Dash styles are mapped to `lineType` instead of `strokeStyle`. `lineType` is missing, which gives `parseInt(null)` = NaN.                                                                                                       |
| L   | `export/PDFExporter.ts`                                                                                           | A temporary container leaks on error. `allowTaint` combined with `toDataURL` throws. Pixels are compared with millimetres.                                                                                                      |
| L   | `export/MDExporter.ts:37,62`, `export/TxtExporter.ts:30`                                                          | `replace('\n','')` only replaces the first newline. All footnotes end up on one line. MIME type `'text/pain'`.                                                                                                                  |

### 3.6 Theme, i18n, utilities

| Sev | Where                                                 | Problem                                                                                                                                                                                                      |
| --- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| H   | `theme/DefaultTheme.ts:95,103`                        | `!result` treats `LineType.THIN_CURVED === 0` as unset, so a user can't choose thin-curved. Use `??` or `=== undefined`.                                                                                     |
| H   | `lang/ja.ts`, `lang/pt.ts`                            | These files contain the _editor's_ react-intl strings and none of the 20 mindplot keys, so Japanese and Portuguese users see new topics titled **"MAIN_TOPIC"**. zh and de are each missing one or two keys. |
| H   | `theme/ColorUtil.ts:45`                               | `lightenColor` doesn't zero-pad (`#000000` → `#f0f0f`), and mis-parses `#fff` and `rgb()`. Prism borders get invalid colors.                                                                                 |
| H   | `theme/RobotTheme.ts:56`, `theme/ClassicTheme.ts:56`  | `getBackgroundColor` returns the **array** from the theme JSON, so the SVG fill becomes `"#10B981,#F59E0B,…"`. Use `pickByOrder`.                                                                            |
| M   | `Messages.ts:28-31`                                   | Locale fallback only splits on `_`, so `zh-CN` and `pt-BR` fall back to English. There is no fallback to the English key.                                                                                    |
| M   | `WidgetBuilder.ts:223,227`                            | `$msg('LINK')` and `$msg('NOTE')` exist in no bundle.                                                                                                                                                        |
| M*  | `theme/PrismTheme.ts:51-80`                           | Always lightens connection and border colors, including colors the user picked explicitly, and in the light variant.                                                                                         |
| M   | `theme/ThemeFactory.ts:69-72`                         | An unknown theme id from the XML throws on first render, so the map can't be opened.                                                                                                                         |
| M   | `util/KeyboardManager.ts:120-162`                     | Modifier order differs between registering and matching, so `ctrl+alt+X` can never fire. `ctrl+plus` never matches `'+'`.                                                                                    |
| M*  | `util/topicReorder.ts:87`                             | Uses the sibling index as `order`, which flips the side under BalancedSorter.                                                                                                                                |
| M   | `model/ToolbarNotifier.ts:81-96`                      | A new `debounce` is created on each call and never cancelled, so an older notification hides a newer one.                                                                                                    |
| L   | `theme/DefaultTheme.ts:75`, `util/EventManager.ts:96` | `opacity \|\| 1` turns `0` into `1`. `delegate()` uses `matches` instead of `closest`. Both helpers are unused.                                                                                              |

---

## 4. Strong typing and modernizing the TypeScript

Ordered so that each step is mechanical, can be reviewed on its own, and makes the next one cheaper.

### Step T1: make the asserts narrow types (no new errors)

```ts
// util/assert.ts (also duplicated in web2d/src/components/peer/utils/assert.ts)
export function $defined<T>(v: T): v is NonNullable<T> {
  return v !== undefined && v !== null;
}
export function $assert(cond: unknown, msg: string | (() => string)): asserts cond {
  if (!cond) {
    const m = typeof msg === 'function' ? msg() : msg;
    console.error(m);
    throw new Error(m);
  }
}
```

This has been measured: it produces **0 new compile errors**, and it makes 11 `!` assertions redundant. Another 7 are redundant already today. It must be written as a `function` declaration, because an `asserts` arrow function needs an explicit type annotation.

Follow-ups:

- Replace the 29 instances of `$assert($defined(x), …)` with `$assert(x != null, …)`.
- Replace `$assert(id, …)` on numeric ids with `id != null`, because id `0` is valid. This is the same root cause as D5.
- Over time, replace `$defined(x)` with `x != null`.

### Step T2: enable `noImplicitAny` (~79 errors)

Main sources of errors:

- `XMLSerializerBeta` (10), `RestPersistenceManager` (7), `DragManager` (6), `FeatureModel` (5), `PersistenceManager` (5), `NodeGraph` (5).
- 7 × TS7016 because lodash has no types. Add `@types/lodash`, or replace lodash:
  - `flatten` → `.flat()`.
  - `cloneDeep(properties)` → `structuredClone`.
  - `cloneDeep(features)` → `features.map(f => f.clone())`. `structuredClone` drops prototypes, so it can't be used for class instances.
  - Keep `debounce` and `throttle`, which need `.cancel()`, or write a small typed helper.

### Step T3: typed event maps

Event names are strings and payloads are `any`. In particular, the `LayoutEventBus` handlers declare `Topic` but receive `NodeModel`. Replace this with a generic dispatcher:

```ts
class EventDispatcher<M extends Record<string, unknown>> {
  addEvent<K extends keyof M>(type: K, fn: (payload: M[K]) => void): void;
  removeEvent<K extends keyof M>(type: K, fn: (payload: M[K]) => void): void;
  fireEvent<K extends keyof M>(type: K, ...a: M[K] extends void ? [] : [M[K]]): void;
}

type LayoutEvents = {
  topicConnected: { parentNode: NodeModel; childNode: NodeModel };
  topicAdded: NodeModel;
  topicRemoved: NodeModel;
  topicDisconect: NodeModel;
  topicResize: { node: NodeModel; size: SizeType };
  topicMoved: { node: NodeModel; position: PositionType };
  forceLayout: void;
  canvasZoomed: { zoom: number };
  canvasPanned: void; /* … */
};
type DesignerEvents = {
  modelUpdate: { undoSteps: number; redoSteps: number };
  featureEdit: { event: 'link' | 'note'; topic: Topic };
  onfocus: void;
  onblur: void;
  loadSuccess: void;
};
```

This removes the 8 explicit `any`, the 2 `@ts-ignore` in `EventDispatcher` (tag internal handlers with a `WeakSet` instead), and the `@ts-ignore` the editor needs for `'featureEdit'`. Make the bus **per Designer** at the same time, which fixes the leak described in 3.3.

### Step T4: typed models

- **Node property bag.** Replace the string-keyed bag (`getProperty(key: string)`, plus about 30 `as` casts) with:
  ```ts
  interface NodeProps { id: number; type: NodeModelType; text?: string; position?: PositionType; imageSize?: SizeType;
    order?: number; shrunken?: boolean; fontSize?: number; fontWeight?: FontWeightType; connectionStyle?: LineType; … }
  getProperty<K extends keyof NodeProps>(k: K): NodeProps[K];
  putProperty<K extends keyof NodeProps>(k: K, v: NodeProps[K]): void;
  ```
  This also removes the `{x:…,y:…}` string-plus-regex storage, a performance gain because `getPosition()` is called about 177 times in hot paths.
- **Features as a discriminated union.** Replace `getType()` followed by about 18 `as LinkModel` casts:
  ```ts
  type FeatureByType = { note: NoteModel; link: LinkModel; icon: SvgIconModel; eicon: EmojiIconModel };
  findFeatureByType<T extends FeatureType>(t: T): FeatureByType[T][];
  ```
  This turns the Beta `'icons'`/`'links'` typo into a compile error.
- **Validate untrusted XML attributes** instead of casting them. Use `as const` lists plus guards:
  ```ts
  const THEMES = ['classic', 'prism', …] as const; type ThemeType = typeof THEMES[number];
  const isTheme = (s: string): s is ThemeType => (THEMES as readonly string[]).includes(s);
  ```
- **`findNodeById(): NodeModel | undefined`** and `RootedTreeSet.find` overloads, instead of `result!` and `null!`.
- **Typed i18n.** Type each locale as `Record<keyof typeof EN, string>` (or use `satisfies`), and use `$msg(key: MsgKey)`. Missing keys (ja, pt, LINK/NOTE) then fail at compile time.

### Step T5: API contracts

- `ChildrenSorterStrategy.predict` is declared to return `void`, but every implementation returns a tuple, so callers index `void`. Change it to `{ order: number; position: Readonly<PositionType> }`.
- `ActionDispatcher`: the abstract and concrete signatures disagree, and method bivariance hides it (`Topic | null` vs `Topic`, `string` vs `string | undefined`, `attributes: object`). Use one interface with property-style signatures so that `strictFunctionTypes` applies.
- Split `Icon` into `Removable` and `Icon`, so emoji and SVG no longer return `{} as FeatureModel`.
- `PositionType` and `SizeType` should become `Readonly<…>`. They are currently mutated through shared references (`MainTopic.ts:77-84`, `DragPivot`).
- **Pin `LineType` values explicitly** (`THIN_CURVED = 0, …`). They are persisted as `connStyle="N"`, so reordering the enum would corrupt saved maps.
- The other enums (`ContentType`, `StrokeStyle`, `PivotType`) should become `as const` unions.

### Step T6: stricter flags

- `noImplicitOverride`: 48 errors, all mechanical.
- `noUncheckedIndexedAccess`: 209 errors. Do this last, area by area.
- Lint: re-enable `@typescript-eslint/no-non-null-assertion` as `warn` to stop new `!`. Add `consistent-type-imports` to break the barrel cycles (`import { Designer } from '..'` in `DesignerKeyboard.ts`, `CommandContext.ts` and `ActionDispatcher.ts`).

### Modernization and cleanup (low risk, opportunistic)

- **Java-style DTOs:** 135 trivial getters and 67 setters. The worst case is `export/freemind/*`. Replace it with plain interfaces plus a `kind` discriminant, which also removes the 7-way `instanceof` chain in `freemind/Map.ts:260-311`.
- **Delete dead code:** `ImageEmoji.ts`, `IconGroupRemoveTip.ts`, `shape/ImageTopicShape.ts`, `layout/GridSorter.ts`, the unused helpers in `util/EventManager.ts` and `util/AjaxUtils.ts`, most of the jQuery shim in `DOMUtils`, `src/@types/index.d.ts` (which only contains the license), and `ThemeStyle.getAllStyles`.
- **Remove duplication:**
  - `OceanTheme` and `SunriseTheme` are byte-identical.
  - The importers have 3 copies each of `escapeXml`, `generateId` and `calculatePosition`, and 4 copies of `createFallbackMap`.
  - There are three overlapping emoji maps of about 600 lines each.
  - The theme code repeats `colors.concat(...)[order % len]` 24 times; replace it with a `pickByOrder()` helper.
- **Remove globals:**
  - `var designer` is declared in `index.ts` and read in `Designer.ts:637`, `Topic.ts:1259` and the icon classes.
  - The static `DragTopic._dragPivot` builds SVG when the module is imported.
  - `customElements.define` also runs at import. There is no `sideEffects` entry in `package.json`, so this breaks SSR.

---

## 5. Performance

Ordered by expected gain.

1. **`LineTopicShape` reports `'image'`** (3.2). Most topics rebuild their shape and redraw their whole subtree on every redraw. A one-line fix.
2. **Map load is O(n²).** `EventBusDispatcher._topicConnected` runs a full `layout(true)` for each connection, and `Topic.addToWorkspace` fires it for every topic. Coalesce into a single scheduled layout, using a microtask or rAF. `loadMap` already fires `forceLayout` at the end.
3. **Linear lookups everywhere:**
   - `RootedTreeSet.find` does a full DFS, about 4 times per connect and twice per drag mousemove.
   - `DesignerModel.findTopicById` is a linear scan per layout `change` event.
   - `Mindmap.findNodeById` is O(R·N) per save and per load.
   - `LayoutManager._collectChanges` calls `_events.find`.
   - Fix: keep a `Map<number, Node>`, a `Map<number, Topic>` and a `WeakMap<NodeModel, Topic>`.
4. **`Designer.applyLayout`** calls `redraw(v, true)` on _every_ topic, i.e. O(n·depth). Redraw once from the root. Toggling the theme variant also redraws everything twice, with two layouts.
5. **Every keystroke in the text editor** calls `setText`, which calls `redraw(variant, true)` and redraws the whole subtree. Text changes don't affect children, so pass `false` and debounce with rAF.
6. **Incremental layout is effectively off.** `Node.hasSizeChanged()` is never reset, so every parent is recomputed on every layout, and `computeOffsets` recomputes the subtree heights again. **Caveat:** `TreeSorter` detects changes by height but lays out by width, so fixing the flag needs a width-based override, or siblings in tree layout will overlap.
7. **Redraw churn:**
   - Every redraw calls every setter on the text shape, even when nothing changed, and web2d rebuilds the tspans each time.
   - There are 3 uncached `getBBox` calls per topic.
   - `hasEmoji()` rebuilds the emoji text about 6 times per redraw.
   - `IconGroup.addIcon` is O(n²).
   - `getMaterialIconUnicode` and the XMind icon tables rebuild 400-key literals on every call. Hoist them to module scope.
8. **Selection and focus:**
   - Select-all and deselect-all are O(n²) and pan the viewport once per topic.
   - `updateShadows` queues an uncoalesced double rAF per bus event.
   - Every wheel or pan event calls `closeEditors()` on every topic, for a single shared editor.
   - Fix: keep a selection `Set`, add a batch API, and use a "pending" flag.
9. **Drag:** `DragConnector` runs a recursive `isChildTopic` on every topic on every mousemove, before the cheap geometric filter. Precompute a `Set` of descendants when the drag starts, and create the drag node lazily once the drag threshold is crossed.
10. **Theme resolution:** `getBorderColor` and `getConnectionColor` walk up the ancestors and call `resolve()` at each level, which is O(depth²) per topic. Cache per redraw pass.
11. **Persistence:**
    - The `_rmXmlInv` character loop: replace it with one regex.
    - `LocalStorageManager` logs the whole XML on every save.
    - `SecureXmlParser` runs `querySelectorAll('*')` twice.
    - XMind `unzipSync` inflates every entry with no size limit, a zip-bomb risk. Filter to `content.(json|xml)` and cap the size.

---

## 6. Unit-test coverage, and running it as part of the integrated test run

### 6.1 Current state

| Area                                                                        | Lines | Line coverage | Branch coverage |
| --------------------------------------------------------------------------- | ----: | ------------: | --------------: |
| `components/*` (top level: Designer, Topic, Relationship, Canvas, Drag*, …) | 5,498 |    **18.3 %** |          13.9 % |
| `commands/`                                                                 |   329 |    **10.0 %** |           0.0 % |
| `theme/`                                                                    |   519 |        34.7 % |          24.2 % |
| `util/`                                                                     |   335 |        37.6 % |          35.9 % |
| `shape/`                                                                    |    66 |        37.9 % |           9.1 % |
| `layout/`                                                                   |   941 |        54.6 % |          38.3 % |
| `security/`                                                                 |   150 |        57.3 % |          38.3 % |
| `model/`                                                                    |   503 |        61.0 % |          54.7 % |
| `persistence/`                                                              |   614 |        64.3 % |          53.6 % |
| `import/`                                                                   |   896 |        77.0 % |          58.0 % |
| `export/` (+ freemind)                                                      |   839 |         ~80 % |           ~79 % |

The largest uncovered files are:

- `Topic.ts` (683 lines, 15 %)
- `HTMLTopicSelected.ts` (578, 1 %)
- `Relationship.ts` (261, 3 %)
- `StandaloneActionDispatcher.ts` (202, 10 %)
- `MultilineTextEditor.ts` (5 %)
- `XMLSerializerBeta.ts` (4 %)
- `commands/DeleteCommand.ts` (5 %)
- `RestPersistenceManager.ts`, `MindplotWebComponent.ts`, `WidgetBuilder.ts` and `util/AjaxUtils.ts` (all 0 %)

The high import/export numbers are partly misleading. They come from snapshot tests, and several of those snapshots **lock in incorrect output** (3.5).

### 6.2 Tests to add, in priority order

Each fix from sections 2–3 must land with a test that fails before the fix. Beyond that, these are the suites that close the largest risk gaps:

1. **Undo/redo round-trip** for `commands/*` and `StandaloneActionDispatcher`. For each command: execute, undo, and assert that the model equals the snapshot taken before; then redo and assert it equals the snapshot taken after. Cover:
   - DeleteCommand: floating topic, child of the central topic (id 0), multi-select.
   - Undo merging in `DesignerUndoManager`.
   - `GenericFunctionCommand` after the order has changed.
   - Shrink with mixed states.
   - Color undo on a topic that inherits its color from the theme.
2. **`XMLSerializerTango` round-trip**, including emoji and astral characters, `]]>` in notes and text, `shrink="false"`, dangling relationships, NaN positions, and unknown theme or layout ids.
3. **Sorter `predict` followed by `connect` consistency**: Balanced, Symmetric and Tree, for same-parent and cross-parent drops, upward and downward, on both sides. Assert that the predicted order equals the order after the drop. The three reproduced off-by-one bugs make good seed cases.
4. **Security:**
   - `HtmlSanitizer` against an XSS vector corpus, including nested disallowed tags.
   - `LinkModel` URL validation.
   - `NoteModel.getPlainText` must not execute anything (spy on `onerror`).
5. **Theme and i18n:**
   - `DefaultTheme.resolve` with `THIN_CURVED` (0) and `opacity` 0.
   - `ColorUtil.lightenColor` with low channels, `#fff` and `rgb()`.
   - A **locale completeness test**: every `lang/*.ts` has every key from `en`.
   - `Messages.init('zh-CN')`.
6. **Importers:**
   - OPML (real documents with `version="1.0"`).
   - FreeMind 0.9 (the version check), forward arrowlinks, icons, `&amp;`.
   - XMind XML with an untitled relationship.
   - Child-only selectors: a parent must not inherit its children's icons or notes.
7. **Persistence managers with a mocked `fetch`:** two saves in a row both settle; an edit made during a save stays dirty; an HTML 502 is handled; an XML `parsererror` is detected.
8. **Canvas and drag events** (jsdom): unbinding after pan, pinch followed by pan, release outside the container, Escape cancels.
9. **`KeyboardManager`:** `ctrl+alt+X`, `ctrl+plus`, Option+letter on macOS.

Suggested coverage targets:

- Next 2 PRs: ratchet up from the baseline.
- After phase 2 (section 7): 50 % lines and 40 % branches.
- End state: 65 % lines and 50 % branches.
- `commands/`, `persistence/`, `security/` and `layout/`: 80 % lines, because they are pure logic and cheap to test.

### 6.3 Running the unit tests as part of the integrated test run

What already exists:

- `yarn test` in mindplot runs `test:unit && test:integration`, with Jest and then Storybook + Cypress.
- The root `yarn test` and the Husky pre-push hook run it for every affected package.

What is missing:

1. **Coverage is not measured or enforced.** Add the following to `packages/mindplot/jest.config.js`:
   ```js
   collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts'],
   coverageReporters: ['text-summary', 'lcov', 'json-summary'],
   coverageThreshold: {
     global: { statements: 38, branches: 33, functions: 34, lines: 37 }, // ratchet up each PR
     './src/components/commands/': { lines: 80 },        // once phase 2 lands
     './src/components/security/': { lines: 80 },
   },
   testPathIgnorePatterns: ['/node_modules/', '/dist/', '/cypress/', '/__tests__/'],
   ```
   Then change the script to `"test:unit": "jest ./test/unit --coverage --silent"`. Because `test` already runs `test:unit`, the threshold becomes a gate in pre-push and in CI with no further wiring.
   - `testPathIgnorePatterns` matters because running `jest` with no arguments currently picks up `cypress/e2e/*.test.js` and `__tests__/mindplot.test.js` (a stale bundle). That produces 5 spurious failing suites.
2. **Optional: one combined coverage report for unit and Cypress tests.**
   - Instrument the Storybook build with `vite-plugin-istanbul`, gated on `CYPRESS_COVERAGE=1`.
   - Add `@cypress/code-coverage` to `cypress.config.js` and the support file.
   - Merge `coverage/unit` and `coverage/cypress` with `nyc merge` and `nyc report`.
   - This shows the true coverage of `Topic`, `Designer` and `Relationship`, which are mostly exercised by Cypress today. Gate only on the unit-test threshold, because Cypress coverage depends on the host.
3. **Pre-push hook robustness** (`.husky/pre-push`). `TEST_EXIT_CODE=$?` inside `if ! "$YARN_CMD" test; then` always captures `0`, so the "no tests configured" branch is dead. If someone "fixes" it, Jest's exit code 1 for failures would start being skipped. Delete that branch. Also, the script uses bash features (`[[`, `<<<`) under `#!/usr/bin/env sh`.
4. **Snapshot hygiene.** Regenerate the import/export snapshots listed in 3.5 in the same PR as each fix, and review the diff by hand. Today they assert the bugs.

---

## 7. Suggested rollout

| Phase                         | Scope                                                                                                                                                             | Size | Gate                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------- |
| **0: Tooling**                | Coverage config, `testPathIgnorePatterns`, threshold at the baseline, pre-push cleanup, `@types/lodash`                                                           | XS   | CI runs coverage                              |
| **1: Security and data loss** | Section 2 (S1–S4, D1–D8), each with a regression test                                                                                                             | M    | No known XSS or data loss                     |
| **2: High-severity bugs**     | 3.1–3.6 **H** rows: undo, LineTopicShape, Canvas touch, sorter predict, OPML, FreeMind version, XMind selector, THIN_CURVED, ja/pt bundles, ColorUtil, Robot fill | M    | Coverage ≥ 50 % lines                         |
| **3: Typing foundation**      | T1 (asserts), T2 (`noImplicitAny`), T3 (typed buses, per-Designer bus and dispose)                                                                                | M    | `noImplicitAny: true`                         |
| **4: Performance**            | Section 5, items 2–6 (load O(n²), indexes, applyLayout, keystroke redraw, incremental layout), with before/after timings on a 500-node map                        | M    | Faster load and drag on a large-map benchmark |
| **5: Typed models**           | T4 and T5 (NodeProps, feature union, validated XML enums, i18n types), plus the **M** bugs they surface                                                           | L    | Coverage ≥ 65 % lines                         |
| **6: Cleanup**                | Dead code, duplication, importers built on the `Mindmap` model, freemind DTOs, `noImplicitOverride`                                                               | M    | —                                             |
| **7: Strict**                 | `noUncheckedIndexedAccess`, area by area                                                                                                                          | L    | Flag on                                       |

Phases 1 and 2 are independent and can run in parallel. Phase 3 should come before phase 5. Phase 4 item 6 (incremental layout) depends on the TreeSorter width override described in section 5.

---

## Appendix: method

- Six parallel read-only reviews, by area: Designer and commands; topics and icons; layout, drag and canvas; model and persistence; import and export; theme, util, i18n and cross-cutting concerns.
- Every high-severity finding was re-checked against the source. Some were reproduced:
  - In jsdom or node: sanitizer bypass, emoji stripping, `]]>` throw, XMind selector, `ColorUtil` padding.
  - With scratch scripts against the real `LayoutManager`: the three sorter off-by-one bugs.
- Rows marked `*` are _likely_, not _confirmed_. They depend on runtime context, such as server-side sanitization or real-world file formats.
- Metrics came from `tsc --noEmit` with each extra flag enabled one at a time, and from `jest --coverage` over `test/unit`.
