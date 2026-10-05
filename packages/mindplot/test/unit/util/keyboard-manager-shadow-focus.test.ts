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

/** Appends a host with an open shadow root to `parent`. */
const shadowRootIn = (parent: Node): ShadowRoot =>
  parent.appendChild(document.createElement('div')).attachShadow({ mode: 'open' });

// BL5-193: document.activeElement is the shadow host when the focus is inside a shadow root, so
// typing in a field of a web component ran the shortcuts.
describe('KeyboardManager with the focus inside a shadow root', () => {
  const owner = {};
  const callback = jest.fn();

  const press = (): void => {
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, composed: true }),
    );
  };

  beforeEach(() => {
    callback.mockReset();
    KeyboardManager.addShortcut(['delete'], callback, owner);
    KeyboardManager.activate(owner);
  });

  afterEach(() => {
    KeyboardManager.removeOwner(owner);
    document.body.innerHTML = '';
  });

  it.each(['input', 'textarea'])('does not fire while typing in an %s', (tag) => {
    const field = shadowRootIn(document.body).appendChild(document.createElement(tag));
    field.focus();

    press();

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not fire while typing in a contentEditable element', () => {
    const editable = shadowRootIn(document.body).appendChild(document.createElement('div'));
    editable.setAttribute('contentEditable', 'true');
    editable.tabIndex = 0;
    editable.focus();

    press();

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not fire while typing in an input of a nested shadow root', () => {
    const outer = shadowRootIn(document.body);
    const input = shadowRootIn(outer).appendChild(document.createElement('input'));
    input.focus();

    press();

    expect(callback).not.toHaveBeenCalled();
  });

  it('fires with the focus on an element of a shadow root that takes no text', () => {
    const button = shadowRootIn(document.body).appendChild(document.createElement('button'));
    button.focus();

    press();

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
