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
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import KeyboardShortcutsHelp from '../../../src/components/action-widget/pane/keyboard-shortcut-help';
import {
  SHORTCUT_CATEGORIES,
  Combo,
} from '../../../src/components/action-widget/pane/keyboard-shortcut-help/shortcuts';
import { renderPane } from './helpers';

const isMacPlatform = jest.fn(() => false);
jest.mock('@wisemapping/mindplot', () => ({
  isMacPlatform: () => isMacPlatform(),
}));

beforeEach(() => {
  isMacPlatform.mockReturnValue(false);
});

const bodyRows = (): HTMLElement[] =>
  within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row');

const label = (descriptor: { defaultMessage?: unknown }): string =>
  String(descriptor.defaultMessage);

/** Expected key caps and joiners for one platform column of a category. */
const expected = (combosOf: (combo: { win: Combo[]; mac: Combo[] }) => Combo[], index: number) => {
  const combos = SHORTCUT_CATEGORIES[index].shortcuts.map(combosOf);
  return {
    keys: combos.flat().flatMap((combo) => combo.keys ?? []),
    alternatives: combos.reduce((sum, list) => sum + list.length - 1, 0),
  };
};

const joiners = (text: string): number =>
  Array.from(document.querySelectorAll('tbody span')).filter((s) => s.textContent === text).length;

describe('KeyboardShortcutsHelp', () => {
  it('opens on the navigation tab with the arrow-key diagram', () => {
    renderPane(<KeyboardShortcutsHelp />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual(
      SHORTCUT_CATEGORIES.map((category) => label(category.label)),
    );
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');

    const diagram = screen.getByRole('img', {
      name: 'Left arrow moves to the parent topic, right arrow to a child, up and down between siblings.',
    });
    expect(within(diagram).getByText('Parent')).toBeTruthy();
    expect(within(diagram).getAllByText('Sibling')).toHaveLength(2);
    expect(within(diagram).getByText('Selected')).toBeTruthy();
    expect(within(diagram).getByText('Child')).toBeTruthy();
    expect(
      within(diagram).getByText('On the left half of the map, ← and → swap roles.'),
    ).toBeTruthy();
  });

  it('lists each category on its own tab, with the Windows/Linux keys off a Mac', () => {
    renderPane(<KeyboardShortcutsHelp />);

    expect(screen.getByRole('columnheader', { name: 'Windows - Linux' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Action' })).toBeTruthy();

    SHORTCUT_CATEGORIES.forEach((category, index) => {
      fireEvent.click(screen.getAllByRole('tab')[index]);

      const rows = bodyRows();
      expect(rows.map((row) => row.firstElementChild?.textContent)).toEqual(
        category.shortcuts.map((shortcut) => label(shortcut.message)),
      );
      // Only the navigation tab has the diagram.
      expect(screen.queryByRole('img') !== null).toBe(category.key === 'navigation');

      const { keys, alternatives } = expected((s) => s.win, index);
      expect(Array.from(document.querySelectorAll('kbd')).map((kbd) => kbd.textContent)).toEqual(
        keys,
      );
      expect(joiners('/')).toBe(alternatives);
    });
  });

  it('shows the Mac keys on a Mac', () => {
    isMacPlatform.mockReturnValue(true);
    renderPane(<KeyboardShortcutsHelp />);

    expect(screen.getByRole('columnheader', { name: 'Mac OS X' })).toBeTruthy();
    SHORTCUT_CATEGORIES.forEach((_category, index) => {
      fireEvent.click(screen.getAllByRole('tab')[index]);
      const { keys } = expected((s) => s.mac, index);
      expect(Array.from(document.querySelectorAll('kbd')).map((kbd) => kbd.textContent)).toEqual(
        keys,
      );
    });
  });

  it('joins a key and a mouse action with "+"', () => {
    renderPane(<KeyboardShortcutsHelp />);
    const editing = SHORTCUT_CATEGORIES.findIndex((category) =>
      category.shortcuts.some((s) => s.message.id === 'shortcut-help-pane.drag-disconnect'),
    );

    fireEvent.click(screen.getAllByRole('tab')[editing]);

    const row = bodyRows().find((r) => r.textContent?.startsWith('Disconnect topic'));
    expect(row?.lastElementChild?.textContent).toBe('Ctrl+drag topic');
  });

  it('shows Cmd+drag for disconnecting a topic on a Mac, as the canvas reads it', () => {
    isMacPlatform.mockReturnValue(true);
    renderPane(<KeyboardShortcutsHelp />);
    const editing = SHORTCUT_CATEGORIES.findIndex((category) =>
      category.shortcuts.some((s) => s.message.id === 'shortcut-help-pane.drag-disconnect'),
    );

    fireEvent.click(screen.getAllByRole('tab')[editing]);

    const row = bodyRows().find((r) => r.textContent?.startsWith('Disconnect topic'));
    // The drag reads hasShortcutModifier(): Cmd on a Mac, where a Ctrl press is the right click.
    expect(row?.lastElementChild?.textContent).toBe('⌘+drag topic');
  });

  it('shows Cmd-click for selecting multiple topics on a Mac, as the canvas reads it', () => {
    isMacPlatform.mockReturnValue(true);
    renderPane(<KeyboardShortcutsHelp />);

    const row = bodyRows().find((r) => r.textContent?.startsWith('Select multiple topics'));
    // Before: 'Ctrl+Mouse click', which on a Mac is the right click, and selects one topic.
    expect(row?.lastElementChild?.textContent).toBe('⌘+Mouse click');
  });

  it('offers a close button only when it can be closed', () => {
    const closeModal = jest.fn();
    const { unmount } = renderPane(<KeyboardShortcutsHelp closeModal={closeModal} />);

    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(closeModal).toHaveBeenCalledTimes(1);
    unmount();

    renderPane(<KeyboardShortcutsHelp />);
    expect(screen.queryByRole('button', { name: 'close' })).toBeNull();
  });

  it('renders the diagram in dark mode', () => {
    renderPane(<KeyboardShortcutsHelp />, 'dark');

    expect(screen.getByRole('img')).toBeTruthy();
  });
});
