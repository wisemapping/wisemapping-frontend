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
import KeyboardManager from '../../../src/components/util/KeyboardManager';

/**
 * Registers through the real KeyboardManager and dispatches real KeyboardEvents.
 *
 * The structural-move bindings are written `alt+shift+up`, while a browser
 * reports `event.key === 'ArrowUp'`. Those only meet because `normalizeShortcut`
 * maps `up` to `arrowup` and sorts modifiers the same way `getEventShortcut`
 * emits them -- two independent code paths that have to agree. Tests that stub
 * `addShortcut` cannot see a mismatch there, so this exercises the real thing.
 */
describe('KeyboardManager arrow shortcuts', () => {
  const press = (key: string, modifiers: Partial<KeyboardEventInit> = {}): void => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...modifiers }));
  };

  afterEach(() => {
    KeyboardManager.removeShortcut([
      'alt+shift+up',
      'alt+shift+down',
      'alt+shift+left',
      'alt+shift+right',
      'up',
    ]);
    document.body.innerHTML = '';
  });

  it.each([
    ['alt+shift+up', 'ArrowUp'],
    ['alt+shift+down', 'ArrowDown'],
    ['alt+shift+left', 'ArrowLeft'],
    ['alt+shift+right', 'ArrowRight'],
  ])('fires %s when the browser reports %s', (shortcut, eventKey) => {
    const callback = jest.fn();
    KeyboardManager.addShortcut([shortcut], callback);

    press(eventKey, { altKey: true, shiftKey: true });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not fire without both modifiers', () => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['alt+shift+up'], callback);

    press('ArrowUp');
    press('ArrowUp', { altKey: true });
    press('ArrowUp', { shiftKey: true });

    expect(callback).not.toHaveBeenCalled();
  });

  it('keeps the plain arrow binding separate from the modified one', () => {
    const plain = jest.fn();
    const modified = jest.fn();
    KeyboardManager.addShortcut(['up'], plain);
    KeyboardManager.addShortcut(['alt+shift+up'], modified);

    press('ArrowUp');
    expect(plain).toHaveBeenCalledTimes(1);
    expect(modified).not.toHaveBeenCalled();

    press('ArrowUp', { altKey: true, shiftKey: true });
    expect(modified).toHaveBeenCalledTimes(1);
    expect(plain).toHaveBeenCalledTimes(1);
  });

  it('is suppressed while focus is in a text field', () => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['alt+shift+up'], callback);

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    press('ArrowUp', { altKey: true, shiftKey: true });

    // Topic label editing must keep its native caret behaviour.
    expect(callback).not.toHaveBeenCalled();
  });
});
