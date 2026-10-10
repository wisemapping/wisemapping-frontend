# Storybook Tests - Simple Smoke Tests

This directory contains a simple smoke test for Storybook stories. The test just verifies that all stories load successfully without errors.

## ✅ Main Goal: Verify Stories Load

The primary goal is to ensure all Storybook stories are loadable and don't have errors. This is a **simple smoke test** approach that is:

- ⚡ Fast (runs in seconds)
- 🎯 Reliable (no fragile selectors)
- ✅ Practical (verifies what matters most)

## 🎨 Verifying Actions (Manual)

**Action logging should be verified manually in the Storybook UI.** This is the proper way to use Storybook.

```bash
# Start Storybook
cd /Users/pveiga/repos/wiseapp/wisemapping-frontend/packages/editor
yarn storybook
```

Then:

1. Open http://localhost:6008
2. Navigate to any story (e.g., Editor/TopicStyleEditor)
3. Open the **Actions panel** at the bottom
4. Interact with the component
5. ✅ Verify actions are logged

## Running the Smoke Tests

### Option 1: Automated (Recommended)

```bash
yarn test:integration:storybook
```

This will:

1. Start Storybook automatically
2. Run smoke tests (verify stories load)
3. Shut down Storybook

### Option 2: Manual (with Storybook already running)

```bash
# Terminal 1: Start Storybook
yarn storybook

# Terminal 2: Run tests
yarn cy:storybook:run
```

### Option 3: Interactive Mode

```bash
# Terminal 1: Start Storybook
yarn storybook

# Terminal 2: Open Cypress UI
yarn cy:storybook:open
```

## Test Coverage

The smoke test verifies all these stories load successfully:

1. **TopicStyleEditor** - Default story
2. **TopicFontEditor** - Default story
3. **TopicLinkEditor** - Default + WithExistingURL stories
4. **RichTextNoteEditor** - Default + WithExistingNote stories
5. **TopicIconEditor** - Default + WithEmoji + WithImage stories
6. **ColorPicker** - Default + WithSelectedColor stories
7. **TopicImagePicker** - Default + WithEmoji + WithImage stories
8. **CanvasStyleEditor** - Default story
9. **KeyboardShortcutHelp** - Default story

## Why Simple Smoke Tests?

Previously, we had complex tests that tried to interact with components and verify actions. However:

❌ **Complex tests were**:

- Slow (lots of waiting)
- Fragile (broke with UI changes)
- Hard to maintain
- Not testing the right thing (Storybook is a manual tool)

✅ **Simple smoke tests are**:

- Fast (< 30 seconds for all stories)
- Reliable (just check stories load)
- Easy to maintain
- Focused on real issue (broken stories)

## What This Tests

The smoke test verifies:

- ✅ Story loads without error
- ✅ No "Story is missing" error
- ✅ No "Failed to load" error
- ✅ Page renders successfully

## What This Doesn't Test

The smoke test does NOT verify:

- ❌ Component interactions
- ❌ Action logging (verify manually)
- ❌ Specific UI elements
- ❌ Component functionality

**Use manual testing in Storybook UI for action verification!**

## Files

- `stories-smoke.cy.ts` - Single smoke test file that tests all stories

## Integration with Main Test Suite

The smoke test is **included** in the main test suite:

```bash
# Full test suite (Unit + Playground + Storybook) ✅
yarn test

# Just integration tests (Playground + Storybook) ✅
yarn test:integration

# Just Storybook smoke tests ⚡
yarn test:integration:storybook
```

The Storybook smoke test:

- ✅ Verifies all stories load without errors
- ⚡ Fast (4 seconds for 11 tests)
- 🎯 Reliable (100% passing)
- 🔧 Part of CI/CD pipeline via `yarn test`

## Troubleshooting

### Storybook won't start

```bash
# Kill any existing processes
killall node

# Start fresh
yarn storybook
```

### Tests timeout

- Check that Storybook is running on port 6008
- Wait for Storybook to fully load before running tests
- Try running tests manually after Storybook is ready

### Story fails to load

- Check the story file for TypeScript/React errors
- Verify component props are correct
- Check browser console for errors

## Related Documentation

- **STORYBOOK_TESTING.md** (in project root) - Complete implementation guide
- **STORYBOOK_ACTIONS_COMPLETE.md** (in project root) - Summary of action logging implementation
- **Storybook Official Docs** - https://storybook.js.org/docs/react/essentials/actions
