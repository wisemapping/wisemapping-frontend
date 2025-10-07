# Storybook Actions and Testing Implementation

This document summarizes the implementation of Storybook actions and Cypress tests for all editor components.

## Overview

All editor component Storybook stories have been updated to properly log actions in the Storybook Actions panel. Additionally, comprehensive Cypress tests have been created to verify that these actions work correctly.

## Fixed Storybook Stories

### 1. TopicStyleEditor

**File**: `src/components/action-widget/pane/topic-style-editor/TopicStyleEditor.stories.tsx`

**Actions implemented**:

- `onShapeChange` - Triggered when the topic shape is changed
- `onFillColorChange` - Triggered when the fill color is changed
- `onBorderColorChange` - Triggered when the border color is changed
- `onBorderStyleChange` - Triggered when the border style is changed
- `onConnectionStyleChange` - Triggered when the connection style is changed
- `onConnectionColorChange` - Triggered when the connection color is changed
- `closeModal` - Triggered when the modal is closed

**Implementation**: Uses a wrapper component `TopicStyleEditorWithActions` that manages state with `React.useState` and `React.useMemo` to provide stable NodeProperty instances.

### 2. TopicFontEditor

**File**: `src/components/action-widget/pane/topic-font-editor/TopicFontEditor.stories.tsx`

**Actions implemented**:

- `onFontFamilyChange` - Triggered when font family is changed
- `onFontSizeSwitch` - Triggered when font size is increased/decreased
- `onFontWeightSwitch` - Triggered when bold is toggled
- `onFontStyleSwitch` - Triggered when italic is toggled
- `onFontColorChange` - Triggered when font color is changed
- `closeModal` - Triggered when the modal is closed

**Implementation**: Uses a wrapper component `TopicFontEditorWithActions` that properly handles both `setValue` and `switchValue` methods of NodeProperty.

### 3. TopicLinkEditor

**File**: `src/components/action-widget/pane/topic-link-editor/TopicLinkEditor.stories.tsx`

**Actions implemented**:

- `onUrlChange` - Triggered when the URL is changed
- `closeModal` - Triggered when the modal is closed

**Stories**:

- Default - Empty URL
- WithExistingURL - Pre-populated with `https://www.wisemapping.com`

### 4. RichTextNoteEditor

**File**: `src/components/action-widget/pane/rich-text-note-editor/RichTextNoteEditor.stories.tsx`

**Actions implemented**:

- `onNoteChange` - Triggered when the note content is changed
- `closeModal` - Triggered when the modal is closed

**Stories**:

- Default - Empty note
- WithExistingNote - Pre-populated with rich text content

### 5. TopicIconEditor

**File**: `src/components/action-widget/pane/topic-icon-editor/TopicIconEditor.stories.tsx`

**Actions implemented**:

- `onIconChange` - Triggered when an icon (emoji or image) is selected
- `closeModal` - Triggered when the modal is closed

**Stories**:

- Default - No icon selected
- WithEmoji - Pre-selected emoji
- WithImage - Pre-selected image icon

### 6. ColorPicker

**File**: `src/components/action-widget/pane/color-picker/ColorPicker.stories.tsx`

**Actions implemented**:

- `onColorChange` - Triggered when a color is selected
- `closeModal` - Triggered when the modal is closed

**Stories**:

- Default - No color selected
- WithSelectedColor - Pre-selected red color

### 7. IconPicker

**File**: `src/components/action-widget/pane/icon-picker/IconPicker.stories.tsx`

**Actions implemented**:

- `onIconChange` - Triggered when an icon is selected
- `triggerClose` - Triggered when the picker should close

**Stories**:

- Default - No icon selected
- WithEmoji - Pre-selected emoji
- WithImage - Pre-selected image icon

**Note**: Has `chromatic: { disableSnapshot: true }` due to the emoji picker.

### 8. TopicImagePicker

**File**: `src/components/action-widget/pane/topic-image-picker/TopicImagePicker.stories.tsx`

**Actions implemented**:

- `onEmojiChange` - Triggered when an emoji is selected
- `onIconsGalleryChange` - Triggered when a gallery image is selected
- `triggerClose` - Triggered when the picker should close

**Stories**:

- Default - No selection
- WithEmoji - Pre-selected emoji
- WithImage - Pre-selected gallery image

### 9. CanvasStyleEditor

**File**: `src/components/action-widget/pane/canvas-style-editor/CanvasStyleEditor.stories.tsx`

**Actions implemented**:

- `onStyleChange` - Triggered when a canvas style is selected
- `closeModal` - Triggered when the modal is closed

**Implementation**: Uses direct `argTypes` configuration (no wrapper needed).

### 10. KeyboardShortcutHelp

**File**: `src/components/action-widget/pane/keyboard-shortcut-help/KeyboardShortcutHelp.stories.tsx`

**Actions implemented**:

- `closeModal` - Triggered when the modal is closed

**Implementation**: Uses direct `argTypes` configuration (no wrapper needed).

## Cypress Tests

### Test Files Created

All Cypress tests are located in `cypress/e2e/storybook/`:

1. `topicStyleEditor.storybook.cy.ts` - Tests all style change actions
2. `topicFontEditor.storybook.cy.ts` - Tests all font change actions
3. `topicLinkEditor.storybook.cy.ts` - Tests URL changes
4. `richTextNoteEditor.storybook.cy.ts` - Tests note editing
5. `topicIconEditor.storybook.cy.ts` - Tests icon selection
6. `colorPicker.storybook.cy.ts` - Tests color selection
7. `iconPicker.storybook.cy.ts` - Tests icon picker
8. `topicImagePicker.storybook.cy.ts` - Tests image/emoji selection
9. `canvasStyleEditor.storybook.cy.ts` - Tests canvas style selection
10. `keyboardShortcutHelp.storybook.cy.ts` - Tests help dialog

### Running the Tests

#### Option 1: Run ALL tests (Unit + Integration + Storybook)

```bash
cd /Users/pveiga/repos/wiseapp/wisemapping-frontend/packages/editor
yarn test
```

This will run:

1. Unit tests (`test:unit`)
2. Integration tests - Playground (`test:integration:playground`)
3. Integration tests - Storybook (`test:integration:storybook`)

#### Option 2: Run only integration tests (Playground + Storybook)

```bash
cd /Users/pveiga/repos/wiseapp/wisemapping-frontend/packages/editor
yarn test:integration
```

This will run both:

1. Playground integration tests
2. Storybook integration tests

#### Option 3: Run only Storybook tests

```bash
cd /Users/pveiga/repos/wiseapp/wisemapping-frontend/packages/editor
yarn test:integration:storybook
```

This command will:

1. Start Storybook on port 6008
2. Wait for it to be ready
3. Run all Cypress Storybook tests
4. Shut down Storybook

#### Option 4: Manual test run (with Storybook already running)

```bash
# Terminal 1: Start Storybook
cd /Users/pveiga/repos/wiseapp/wisemapping-frontend/packages/editor
yarn storybook

# Terminal 2: Run Cypress tests
cd /Users/pveiga/repos/wiseapp/wisemapping-frontend/packages/editor
yarn cy:storybook:run
```

#### Option 5: Interactive Cypress UI

```bash
# Terminal 1: Start Storybook
cd /Users/pveiga/repos/wiseapp/wisemapping-frontend/packages/editor
yarn storybook

# Terminal 2: Open Cypress UI
cd /Users/pveiga/repos/wiseapp/wisemapping-frontend/packages/editor
yarn cy:storybook:open
```

### Configuration Files

- **cypress.storybook.config.ts** - Cypress configuration for Storybook tests
  - Sets `baseUrl` to `http://localhost:6008`
  - Specifies test files in `cypress/e2e/storybook/`
- **cypress.config.ts** - Original Cypress configuration for integration tests
  - Sets `baseUrl` to `http://localhost:8081`
  - Tests the full editor application

## Technical Approach

### The Wrapper Pattern

Most components use a "wrapper" pattern to properly expose actions:

```typescript
const ComponentWithActions = (props: {
  closeModal: () => void;
  onXxxChange?: (value: Type) => void;
}) => {
  const [value, setValue] = React.useState<Type>(props.initialValue);

  const model: NodeProperty<Type> = React.useMemo(
    () => ({
      getValue: () => value,
      setValue: (v: Type) => {
        setValue(v);
        props.onXxxChange?.(v);
      },
    }),
    [value, props.onXxxChange]
  );

  return <Component model={model} closeModal={props.closeModal} />;
};
```

This pattern:

1. Manages component state internally
2. Exposes callback props that Storybook can track
3. Uses `React.useMemo` to prevent unnecessary re-renders
4. Avoids infinite loops caused by Storybook's function instrumentation

### Why This Approach?

The direct use of `fn()` from `@storybook/test` inside `NodeProperty` methods caused infinite re-render loops because:

1. Storybook instruments `fn()` calls to log them
2. Components frequently call `getValue()` during render
3. This created a render → call `getValue()` → Storybook logs → re-render loop

The wrapper pattern solves this by:

1. Keeping `NodeProperty` methods simple and uninstrumented
2. Only calling the tracked callback (`onXxxChange`) when actual changes occur
3. Using `React.useMemo` to keep `NodeProperty` references stable

## Package.json Changes

Updated `package.json` scripts:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6008", // Changed from 6006 to 6008
    "cy:storybook:open": "cypress open --config-file cypress.storybook.config.ts",
    "cy:storybook:run": "cypress run --config-file cypress.storybook.config.ts",
    "test": "yarn test:unit && yarn test:integration",
    "test:integration": "yarn test:integration:playground && yarn test:integration:storybook",
    "test:integration:playground": "npx start-server-and-test 'yarn playground' http-get://localhost:8081 'yarn cy:run'",
    "test:integration:storybook": "npx start-server-and-test 'yarn storybook' http-get://localhost:6008 'yarn cy:storybook:run'"
  }
}
```

**Test Hierarchy:**

- `yarn test` - Runs unit tests + integration tests (playground + storybook)
- `yarn test:unit` - Runs Jest unit tests only
- `yarn test:integration` - Runs both playground and Storybook integration tests
- `yarn test:integration:playground` - Runs Cypress tests against the playground editor
- `yarn test:integration:storybook` - Runs Cypress tests against Storybook stories

## Best Practices

1. **Always use wrapper components** for components with `NodeProperty` props
2. **Use `React.useMemo`** to stabilize `NodeProperty` instances
3. **Use `argTypes`** to configure actions in the Storybook meta
4. **Avoid `fn()` directly** in frequently-called methods like `getValue()`
5. **Add `chromatic: { disableSnapshot: true }`** for components with external pickers (emoji, etc.)

## Verification

To verify actions are working:

1. Start Storybook: `yarn storybook`
2. Open any story (e.g., TopicStyleEditor)
3. Open the "Actions" panel at the bottom
4. Interact with the component
5. Verify actions are logged in the panel

To verify tests are passing:

1. Run: `yarn test:integration:storybook` (Storybook only)
2. Or run: `yarn test:integration` (Playground + Storybook)
3. Or run: `yarn test` (Unit + Playground + Storybook)
4. All tests should pass ✓

## Files Modified

### Storybook Stories

- `src/components/action-widget/pane/topic-style-editor/TopicStyleEditor.stories.tsx`
- `src/components/action-widget/pane/topic-font-editor/TopicFontEditor.stories.tsx`
- `src/components/action-widget/pane/topic-link-editor/TopicLinkEditor.stories.tsx`
- `src/components/action-widget/pane/rich-text-note-editor/RichTextNoteEditor.stories.tsx`
- `src/components/action-widget/pane/topic-icon-editor/TopicIconEditor.stories.tsx`
- `src/components/action-widget/pane/color-picker/ColorPicker.stories.tsx` (created)
- `src/components/action-widget/pane/icon-picker/IconPicker.stories.tsx`
- `src/components/action-widget/pane/topic-image-picker/TopicImagePicker.stories.tsx`
- `src/components/action-widget/pane/canvas-style-editor/CanvasStyleEditor.stories.tsx`
- `src/components/action-widget/pane/keyboard-shortcut-help/KeyboardShortcutHelp.stories.tsx`

### Cypress Tests

- `cypress/e2e/storybook/topicStyleEditor.storybook.cy.ts` (created)
- `cypress/e2e/storybook/topicFontEditor.storybook.cy.ts` (created)
- `cypress/e2e/storybook/topicLinkEditor.storybook.cy.ts` (created)
- `cypress/e2e/storybook/richTextNoteEditor.storybook.cy.ts` (created)
- `cypress/e2e/storybook/topicIconEditor.storybook.cy.ts` (created)
- `cypress/e2e/storybook/colorPicker.storybook.cy.ts` (created)
- `cypress/e2e/storybook/iconPicker.storybook.cy.ts` (created)
- `cypress/e2e/storybook/topicImagePicker.storybook.cy.ts` (created)
- `cypress/e2e/storybook/canvasStyleEditor.storybook.cy.ts` (created)
- `cypress/e2e/storybook/keyboardShortcutHelp.storybook.cy.ts` (created)
- `cypress/e2e/storybook/README.md` (created)

### Configuration

- `package.json` (updated scripts)
- `cypress.storybook.config.ts` (created)

## Future Improvements

1. Consider adding visual regression testing with Percy or Chromatic
2. Add tests for keyboard interactions
3. Add tests for accessibility (a11y)
4. Consider using Storybook's interaction testing addon as an alternative to Cypress
5. Add performance monitoring for component render times
