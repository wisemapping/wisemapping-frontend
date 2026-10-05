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

/** Drops every pause the previous test left behind: pauses are counted, and nest. */
const resetPause = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (DesignerKeyboard as any)._pauseCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (DesignerKeyboard as any)._stalePauseCount = 0;
  DesignerKeyboard.resume();
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
    resetPause();
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

/**
 * pause() and resume() come in pairs, and the pairs nest: a pane pauses the
 * shortcuts and a text field inside it pauses them again while focused. The
 * field's resume must not bring the shortcuts back while the pane is open.
 */
describe('DesignerKeyboard nested pause (BL-36)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = registerOnContainer();
    hover(container, 'mouseenter');
    resetPause();
  });

  it('stays paused until every pause is resumed', () => {
    DesignerKeyboard.pause(); // the pane opens
    DesignerKeyboard.pause(); // a text field in it gets the focus

    DesignerKeyboard.resume(); // the text field loses the focus
    expect(DesignerKeyboard.isDisabled()).toBe(true);

    DesignerKeyboard.resume(); // the pane closes
    expect(DesignerKeyboard.isDisabled()).toBe(false);
  });

  it('does not let an extra resume cancel a later pause', () => {
    DesignerKeyboard.resume();
    DesignerKeyboard.resume();

    DesignerKeyboard.pause();
    expect(DesignerKeyboard.isDisabled()).toBe(true);

    DesignerKeyboard.resume();
    expect(DesignerKeyboard.isDisabled()).toBe(false);
  });

  it('keeps the hover pause while an outer pause is still held', () => {
    DesignerKeyboard.pause();
    DesignerKeyboard.pause();
    hover(container, 'mouseleave');

    DesignerKeyboard.resume();
    expect(DesignerKeyboard.isDisabled()).toBe(true);

    // The last resume lifts the hover pause too, as a single resume always did.
    DesignerKeyboard.resume();
    expect(DesignerKeyboard.isDisabled()).toBe(false);
  });
});

describe('DesignerKeyboard register (BL-37)', () => {
  afterEach(() => {
    resetPause();
  });

  it('keeps a pause requested before the designer was built', () => {
    const container = document.createElement('div');
    const designer = {
      getModel: jest.fn().mockReturnValue({}),
      getContainer: () => container,
    } as unknown as Designer;

    // useEditor pauses the keyboard (enableKeyboardEvents=false) in an effect that
    // can run before the designer exists ...
    DesignerKeyboard.pause();
    const keyboard = DesignerKeyboard.register(designer);

    expect(DesignerKeyboard.isDisabled()).toBe(true);

    DesignerKeyboard.resume();
    expect(DesignerKeyboard.isDisabled()).toBe(false);
    keyboard.dispose();
  });
});

/**
 * A pause() whose resume() never comes (a caller that unmounts without it) used to
 * keep the shortcuts off for every designer built after it. The pauses still held
 * when the registered designer is disposed belong to that designer's UI: the next
 * designer drops them, with a warning. A pause taken once the previous designer is
 * gone is kept (BL-37).
 */
describe('DesignerKeyboard leaked pause (BL5-26)', () => {
  const buildDesigner = (): Designer => {
    const container = document.createElement('div');
    return {
      getModel: jest.fn().mockReturnValue({}),
      getContainer: () => container,
    } as unknown as Designer;
  };

  let warn: jest.SpyInstance;
  let keyboard: DesignerKeyboard | undefined;

  const register = (): DesignerKeyboard => {
    keyboard = DesignerKeyboard.register(buildDesigner());
    return keyboard;
  };

  beforeEach(() => {
    resetPause();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    keyboard?.dispose();
    warn.mockRestore();
    resetPause();
  });

  it('drops a pause leaked by the previous designer, with a warning', () => {
    register();
    DesignerKeyboard.pause(); // never resumed
    keyboard!.dispose();

    register();

    expect(DesignerKeyboard.isDisabled()).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('does not warn when the pause is resumed after the designer is disposed', () => {
    register();
    DesignerKeyboard.pause();
    keyboard!.dispose();
    DesignerKeyboard.resume(); // e.g. a pane unmounted after the designer

    register();

    expect(DesignerKeyboard.isDisabled()).toBe(false);
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps a pause taken for the next designer while dropping the leaked one', () => {
    register();
    DesignerKeyboard.pause(); // leaked
    keyboard!.dispose();
    DesignerKeyboard.pause(); // the next editor mounts with its keyboard events off

    register();
    expect(DesignerKeyboard.isDisabled()).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);

    DesignerKeyboard.resume();
    expect(DesignerKeyboard.isDisabled()).toBe(false);
  });
});
