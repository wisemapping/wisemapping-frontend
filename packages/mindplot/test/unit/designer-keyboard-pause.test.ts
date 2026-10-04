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
import DesignerKeyboard from '../../src/components/DesignerKeyboard';
import Designer from '../../src/components/Designer';

jest.mock('../../src/components/SvgImageIcon', () => ({ default: jest.fn() }));
jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {},
}));

/**
 * Wires the canvas hover listeners `DesignerKeyboard` registers, on a bare
 * container, and returns that container.
 */
const registerOnContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  const designer = {
    getModel: jest.fn().mockReturnValue({}),
    getContainer: () => container,
  } as unknown as Designer;

  const instance = Object.create(DesignerKeyboard.prototype) as DesignerKeyboard;
  instance.addShortcut = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (DesignerKeyboard.prototype as any)._registerEvents.call(instance, designer);
  return container;
};

const hover = (container: HTMLElement, type: 'mouseenter' | 'mouseleave') =>
  container.dispatchEvent(new MouseEvent(type));

/**
 * The map shortcuts are off while the pointer is outside the canvas, and while
 * the editor has a dialog or text field open (`pause()`/`resume()`). The two
 * are separate reasons: moving the pointer over the canvas must not bring
 * Delete and Backspace back behind an open dialog.
 */
describe('DesignerKeyboard pause', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = registerOnContainer();
    hover(container, 'mouseenter');
    DesignerKeyboard.resume();
  });

  it('stays paused when the pointer enters the canvas while a dialog is open', () => {
    DesignerKeyboard.pause();

    hover(container, 'mouseleave');
    hover(container, 'mouseenter');

    expect(DesignerKeyboard.isDisabled()).toBe(true);
  });

  it('comes back once the dialog resumes it', () => {
    DesignerKeyboard.pause();
    hover(container, 'mouseenter');

    DesignerKeyboard.resume();

    expect(DesignerKeyboard.isDisabled()).toBe(false);
  });

  it('pauses while the pointer is outside the canvas', () => {
    hover(container, 'mouseleave');
    expect(DesignerKeyboard.isDisabled()).toBe(true);

    hover(container, 'mouseenter');
    expect(DesignerKeyboard.isDisabled()).toBe(false);
  });

  it('stays paused when the pointer leaves after a dialog opened', () => {
    DesignerKeyboard.pause();
    hover(container, 'mouseleave');

    expect(DesignerKeyboard.isDisabled()).toBe(true);
  });
});
