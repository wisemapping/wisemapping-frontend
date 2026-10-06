/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * The shortcut table as data rather than markup.
 *
 * It used to be 35 hand-written `<TableRow>` blocks -- three cells each,
 * repeating the same five `sx` objects -- which is why the pane ran to 769
 * lines for what is a list of key combinations. Nothing could group, filter or
 * highlight them, so the whole set arrived as one 60vh scroll.
 *
 * Keys are kept as tokens, not as pre-joined strings like 'Ctrl + Shift + V',
 * so a renderer can draw each one as its own key cap.
 *
 * Every message is written as a literal `defineMessage` call so that
 * `i18n:extract` can find it; an id or text passed through a variable is
 * invisible to it and drops out of lang/en.json.
 */
import { defineMessage } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';

/** A key name as it appears on a cap. */
export type KeyToken = string;

/**
 * One way to invoke an action.
 *
 * `keys` are pressed together. `note` carries the combinations
 * that are not keystrokes at all -- 'Double Click', 'Mouse click',
 * 'Two-finger swipe' -- which previously sat in nested `<FormattedMessage>`
 * elements inside the cell. Their message ids are preserved verbatim so the
 * existing translations keep resolving.
 */
export type Combo = {
  keys?: KeyToken[];
  note?: MessageDescriptor;
};

export type Shortcut = {
  /** The action description. Its id is unchanged from the old markup. */
  message: MessageDescriptor;
  /** Alternative ways to invoke it, rendered separated by '/'. */
  win: Combo[];
  mac: Combo[];
};

export type ShortcutCategory = {
  /** Stable key, used for the tab value and for diagram lookups. */
  key: string;
  label: MessageDescriptor;
  shortcuts: Shortcut[];
};

const EDIT_TOPIC_NOTE = {
  note: defineMessage({
    id: 'shortcut-help-pane.edit-topic-key',
    defaultMessage: 'F2 or Double Click',
  }),
};

const OVERWRITE_NOTE = {
  note: defineMessage({
    id: 'shortcut-help-pane.overwrite-edit-topic-key',
    defaultMessage: 'Type on a selected topic',
  }),
};

const ARROW_KEYS_NOTE = {
  note: defineMessage({ id: 'shortcut-help-pane.navigation-keys', defaultMessage: 'Arrow keys' }),
};

const MOUSE_CLICK_NOTE = {
  note: defineMessage({
    id: 'shortcut-help-pane.select-topics-keys',
    defaultMessage: 'Mouse click',
  }),
};

const WHEEL_NOTE = {
  note: defineMessage({
    id: 'shortcut-help-pane.pan-canvas-keys',
    defaultMessage: 'Two-finger swipe or Mouse wheel',
  }),
};

export const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    key: 'navigation',
    label: defineMessage({
      id: 'shortcut-help-pane.category-navigation',
      defaultMessage: 'Navigate',
    }),
    shortcuts: [
      {
        message: defineMessage({
          id: 'shortcut-help-pane.navigation',
          defaultMessage: 'Navigation',
        }),
        win: [{ ...ARROW_KEYS_NOTE }],
        mac: [{ ...ARROW_KEYS_NOTE }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.select-topics',
          defaultMessage: 'Select multiple topics',
        }),
        win: [{ keys: ['Ctrl'], ...MOUSE_CLICK_NOTE }],
        // Cmd, as the canvas reads it: a Ctrl click on a Mac is the right click.
        mac: [{ keys: ['⌘'], ...MOUSE_CLICK_NOTE }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.select-all-topics',
          defaultMessage: 'Select all topics',
        }),
        win: [{ keys: ['Ctrl', 'A'] }],
        mac: [{ keys: ['⌘', 'A'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.deselect-all-topics',
          defaultMessage: 'Deselect all topics',
        }),
        win: [{ keys: ['Ctrl', 'Shift', 'A'] }],
        mac: [{ keys: ['⌘', 'Shift', 'A'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.find-in-map',
          defaultMessage: 'Find node in map',
        }),
        win: [{ keys: ['Ctrl', 'F'] }],
        mac: [{ keys: ['⌘', 'F'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.collapse-children',
          defaultMessage: 'Collpase children',
        }),
        win: [{ keys: ['Space'] }],
        mac: [{ keys: ['Space'] }],
      },
    ],
  },
  {
    key: 'editing',
    label: defineMessage({ id: 'shortcut-help-pane.category-editing', defaultMessage: 'Edit' }),
    shortcuts: [
      {
        message: defineMessage({
          id: 'shortcut-help-pane.add-sibling',
          defaultMessage: 'Add sibling topic',
        }),
        win: [{ keys: ['Enter'] }],
        mac: [{ keys: ['Enter'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.add-child',
          defaultMessage: 'Add child topic',
        }),
        win: [{ keys: ['Insert'] }, { keys: ['Tab'] }],
        mac: [{ keys: ['⌘', 'Enter'] }, { keys: ['Tab'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.delete-topic',
          defaultMessage: 'Delete topic',
        }),
        win: [{ keys: ['Delete'] }],
        mac: [{ keys: ['Delete'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.edit-topic',
          defaultMessage: 'Edit topic text',
        }),
        win: [{ ...EDIT_TOPIC_NOTE }],
        mac: [{ ...EDIT_TOPIC_NOTE }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.overwrite-edit-topic',
          defaultMessage: 'Overwrite topic text',
        }),
        win: [{ ...OVERWRITE_NOTE }],
        mac: [{ ...OVERWRITE_NOTE }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.edit-multiline',
          defaultMessage: 'Add multi-line topic text',
        }),
        win: [{ keys: ['Ctrl', 'Enter'] }],
        mac: [{ keys: ['⌘', 'Enter'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.copy-and-text',
          defaultMessage: 'Copy and paste topics/Copy mindmap image to clipboard.',
        }),
        win: [{ keys: ['Ctrl', 'C'] }, { keys: ['Ctrl', 'V'] }],
        mac: [{ keys: ['⌘', 'C'] }, { keys: ['⌘', 'V'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.paste-as-child',
          defaultMessage: 'Paste as child of the selected topic',
        }),
        win: [{ keys: ['Ctrl', 'Shift', 'V'] }],
        mac: [{ keys: ['⌘', '⇧', 'V'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.drag-disconnect',
          defaultMessage: 'Disconnect topic',
        }),
        win: [
          {
            keys: ['Ctrl'],
            note: defineMessage({
              id: 'shortcut-help-pane.drag-disconnect-key',
              defaultMessage: 'drag topic',
            }),
          },
        ],
        mac: [
          {
            keys: ['⌘'],
            note: defineMessage({
              id: 'shortcut-help-pane.drag-disconnect-key',
              defaultMessage: 'drag topic',
            }),
          },
        ],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.move-topic-up',
          defaultMessage: 'Move topic up among siblings',
        }),
        win: [{ keys: ['Alt', 'Shift', 'Up'] }],
        mac: [{ keys: ['⌥', '⇧', 'Up'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.move-topic-down',
          defaultMessage: 'Move topic down among siblings',
        }),
        win: [{ keys: ['Alt', 'Shift', 'Down'] }],
        mac: [{ keys: ['⌥', '⇧', 'Down'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.outdent-topic',
          defaultMessage: 'Outdent topic (attach to grandparent)',
        }),
        win: [{ keys: ['Alt', 'Shift', 'Left'] }],
        mac: [{ keys: ['⌥', '⇧', 'Left'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.indent-topic',
          defaultMessage: 'Indent topic (attach to sibling above)',
        }),
        win: [{ keys: ['Alt', 'Shift', 'Right'] }],
        mac: [{ keys: ['⌥', '⇧', 'Right'] }],
      },
      {
        message: defineMessage({ id: 'shortcut-help-pane.undo', defaultMessage: 'Undo edition' }),
        win: [{ keys: ['Ctrl', 'Z'] }],
        mac: [{ keys: ['⌘', 'Z'] }],
      },
      {
        message: defineMessage({ id: 'shortcut-help-pane.redo', defaultMessage: 'Redo edition' }),
        win: [{ keys: ['Ctrl', 'Shift', 'Z'] }],
        mac: [{ keys: ['⌘', 'Shift', 'Z'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.cancel-text-changes',
          defaultMessage: 'Cancel text changes',
        }),
        win: [{ keys: ['Esc'] }],
        mac: [{ keys: ['Esc'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.save-changes',
          defaultMessage: 'Save changes',
        }),
        win: [{ keys: ['Ctrl', 'S'] }],
        mac: [{ keys: ['⌘', 'S'] }],
      },
    ],
  },
  {
    key: 'format',
    label: defineMessage({ id: 'shortcut-help-pane.category-format', defaultMessage: 'Format' }),
    shortcuts: [
      {
        message: defineMessage({
          id: 'shortcut-help-pane.change-font-bold',
          defaultMessage: 'Change text to bold',
        }),
        win: [{ keys: ['Ctrl', 'B'] }],
        mac: [{ keys: ['⌘', 'B'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.change-font-italic',
          defaultMessage: 'Change text to italic',
        }),
        win: [{ keys: ['Ctrl', 'I'] }],
        mac: [{ keys: ['⌘', 'I'] }],
      },
      {
        message: defineMessage({ id: 'shortcut-help-pane.add-note', defaultMessage: 'Add note' }),
        win: [{ keys: ['Ctrl', 'K'] }],
        mac: [{ keys: ['⌘', 'K'] }],
      },
      {
        message: defineMessage({ id: 'shortcut-help-pane.add-link', defaultMessage: 'Add link' }),
        win: [{ keys: ['Ctrl', 'L'] }],
        mac: [{ keys: ['⌘', 'L'] }],
      },
    ],
  },
  {
    key: 'view',
    label: defineMessage({ id: 'shortcut-help-pane.category-view', defaultMessage: 'View' }),
    shortcuts: [
      {
        message: defineMessage({ id: 'shortcut-help-pane.zoom-in', defaultMessage: 'Zoom in' }),
        win: [{ keys: ['Ctrl', '='] }],
        mac: [{ keys: ['⌘', '='] }],
      },
      {
        message: defineMessage({ id: 'shortcut-help-pane.zoom-out', defaultMessage: 'Zoom out' }),
        win: [{ keys: ['Ctrl', '-'] }],
        mac: [{ keys: ['⌘', '-'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.zoom-to-fit',
          defaultMessage: 'Zoom to fit',
        }),
        win: [{ keys: ['Ctrl', '0'] }],
        mac: [{ keys: ['⌘', '0'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.pan-canvas',
          defaultMessage: 'Pan the canvas',
        }),
        win: [{ ...WHEEL_NOTE }],
        mac: [{ ...WHEEL_NOTE }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.zoom-wheel',
          defaultMessage: 'Zoom in/out with the wheel',
        }),
        win: [
          { keys: ['Ctrl'], ...WHEEL_NOTE },
          { keys: ['Alt'], ...WHEEL_NOTE },
        ],
        mac: [
          { keys: ['⌘'], ...WHEEL_NOTE },
          { keys: ['⌥'], ...WHEEL_NOTE },
        ],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.outline-view',
          defaultMessage: 'Open outline view',
        }),
        win: [{ keys: ['Ctrl', 'O'] }],
        mac: [{ keys: ['⌘', 'O'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.expand-by-level',
          defaultMessage: 'Expand topics by level',
        }),
        win: [{ keys: ['Ctrl', 'E'] }],
        mac: [{ keys: ['⌘', 'E'] }],
      },
      {
        message: defineMessage({
          id: 'shortcut-help-pane.expand-collapse-all',
          defaultMessage: 'Expand/Collapse all topics',
        }),
        win: [{ keys: ['Ctrl', 'Shift', 'E'] }],
        mac: [{ keys: ['⌘', 'Shift', 'E'] }],
      },
    ],
  },
];

export default SHORTCUT_CATEGORIES;
