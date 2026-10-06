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

/** Owners, typing in fields, and the keys that are matched by their key code. */

const press = (init: KeyboardEventInit & { keyCode?: number }) => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  if (init.keyCode !== undefined) {
    Object.defineProperty(event, 'keyCode', { value: init.keyCode });
  }
  document.dispatchEvent(event);
  return event;
};

afterEach(() => {
  KeyboardManager.clearAll();
  document.body.innerHTML = '';
});

describe('KeyboardManager owners', () => {
  it('runs the shortcut of the active owner, falling back to a shared one', () => {
    const first = {};
    const second = {};
    const firstSave = jest.fn();
    const secondSave = jest.fn();
    const shared = jest.fn();
    KeyboardManager.addShortcut(['ctrl+s'], firstSave, first);
    KeyboardManager.addShortcut(['ctrl+s'], secondSave, second);
    KeyboardManager.addShortcut(['ctrl+h'], shared);

    // The first owner registered is active until another one is activated.
    expect(KeyboardManager.isActive(first)).toBe(true);
    press({ key: 's', ctrlKey: true });
    expect(firstSave).toHaveBeenCalledTimes(1);

    KeyboardManager.activate(second);
    const event = press({ key: 's', metaKey: true });
    expect(secondSave).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);

    press({ key: 'h', ctrlKey: true });
    expect(shared).toHaveBeenCalledTimes(1);
    expect(KeyboardManager.getShortcuts().sort()).toEqual(['ctrl+h', 'ctrl+s']);
  });

  it('hands the keys to the owner registered last when the active one is removed', () => {
    const first = {};
    const second = {};
    const callback = jest.fn();
    KeyboardManager.addShortcut(['x'], jest.fn(), first);
    KeyboardManager.addShortcut(['x'], callback, second);
    KeyboardManager.activate(first);

    KeyboardManager.removeOwner(first);
    expect(KeyboardManager.isActive(second)).toBe(true);
    press({ key: 'x' });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('stops listening once the last owner is removed', () => {
    const owner = {};
    const callback = jest.fn();
    KeyboardManager.addShortcut(['x'], callback, owner);
    KeyboardManager.removeOwner(owner);
    press({ key: 'x' });
    expect(callback).not.toHaveBeenCalled();
    expect(KeyboardManager.getShortcuts()).toEqual([]);
  });

  it('accepts cmd and option as aliases of ctrl and alt', () => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['cmd+option+k'], callback);
    press({ key: 'k', metaKey: true, altKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('KeyboardManager while typing', () => {
  const field = (html: string, selector: string) => {
    document.body.innerHTML = html;
    const element = document.querySelector<HTMLElement>(selector)!;
    element.tabIndex = 0;
    element.focus();
  };

  it.each([
    ['an input', '<input id="f"/>', '#f'],
    ['a text area', '<textarea id="f"></textarea>', '#f'],
    ['an editable element', '<div id="f" contentEditable="true"></div>', '#f'],
    [
      'an element inside an editable one',
      '<div contentEditable="true"><span id="f">x</span></div>',
      '#f',
    ],
  ])('ignores the shortcuts while the focus is in %s', (_name, html, selector) => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['delete'], callback);
    field(html, selector);
    press({ key: 'Delete' });
    expect(callback).not.toHaveBeenCalled();
  });

  it('runs the shortcuts while the focus is on another element', () => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['delete'], callback);
    field('<button id="f">b</button>', '#f');
    press({ key: 'Delete' });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('KeyboardManager keys', () => {
  it('matches a digit by its key code, whatever character shift gives it', () => {
    const callback = jest.fn();
    KeyboardManager.addShortcut(['shift+1'], callback);
    press({ key: '!', shiftKey: true, keyCode: 49 });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('tells the numpad digits apart', () => {
    const numpad = jest.fn();
    const digit = jest.fn();
    KeyboardManager.addShortcut(['numpad5'], numpad);
    KeyboardManager.addShortcut(['5'], digit);
    press({ key: '5', keyCode: 101 });
    expect(numpad).toHaveBeenCalledTimes(1);
    expect(digit).not.toHaveBeenCalled();
  });

  it.each([
    ['esc', 'Escape'],
    ['del', 'Delete'],
    ['ins', 'Insert'],
    ['return', 'Enter'],
    ['space', ' '],
    ['f2', 'F2'],
    ['pageup', 'PageUp'],
  ])('matches the binding %s with the %j key', (binding, key) => {
    const callback = jest.fn();
    KeyboardManager.addShortcut([binding], callback);
    press({ key });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('removes a shortcut of an owner', () => {
    const owner = {};
    const callback = jest.fn();
    KeyboardManager.addShortcut(['x'], callback, owner);
    KeyboardManager.removeShortcut(['X'], owner);
    press({ key: 'x' });
    expect(callback).not.toHaveBeenCalled();
  });
});
