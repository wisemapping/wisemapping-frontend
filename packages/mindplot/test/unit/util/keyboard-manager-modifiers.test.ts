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
 * The registration side (normalizeShortcut) and the event side
 * (getEventShortcut) build the lookup key independently; they must produce the
 * same modifier order and the same key name or a binding can never fire.
 */
describe('KeyboardManager modifier and key canonicalisation', () => {
  const press = (key: string, modifiers: Partial<KeyboardEventInit> = {}): void => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...modifiers }));
  };

  afterEach(() => {
    KeyboardManager.clearAll();
    document.body.innerHTML = '';
  });

  it('fires a ctrl+alt shortcut', () => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['ctrl+alt+k'], callback);

    press('k', { ctrlKey: true, altKey: true });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('fires a meta+alt shortcut with the meta key (macOS)', () => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['meta+alt+k'], callback);

    press('k', { metaKey: true, altKey: true });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('fires ctrl+alt+shift regardless of the order the binding was written in', () => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['shift+alt+ctrl+k'], callback);

    press('K', { ctrlKey: true, altKey: true, shiftKey: true });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not fire a ctrl+alt shortcut on ctrl alone', () => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['ctrl+alt+k'], callback);

    press('k', { ctrlKey: true });
    press('k', { altKey: true });

    expect(callback).not.toHaveBeenCalled();
  });

  it('fires ctrl+plus when the browser reports the "+" key', () => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['ctrl+plus'], callback);

    press('+', { ctrlKey: true });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('fires meta+plus when the browser reports the "+" key (macOS)', () => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['meta+plus'], callback);

    press('+', { metaKey: true });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['ctrl+=', '='],
    ['ctrl+-', '-'],
    ['ctrl+0', '0'],
    ['ctrl+shift+z', 'Z'],
  ])('keeps %s working', (shortcut, key) => {
    const callback = jest.fn();
    KeyboardManager.addShortcut([shortcut], callback);

    press(key, { ctrlKey: true, shiftKey: shortcut.includes('shift') });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('removes a shortcut written in a different modifier order', () => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['ctrl+alt+k'], callback);
    KeyboardManager.removeShortcut(['alt+ctrl+k']);

    press('k', { ctrlKey: true, altKey: true });

    expect(callback).not.toHaveBeenCalled();
  });
});
