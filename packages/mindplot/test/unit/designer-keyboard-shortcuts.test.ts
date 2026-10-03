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

type Registered = Map<string, () => void>;

/**
 * Captures what `DesignerKeyboard.register` binds, without a live Designer.
 *
 * The point of these assertions is ownership: zoom used to be registered both
 * here and on `document` by the editor's visualization toolbar, so one keypress
 * produced two zoom steps -- and the toolbar copy also ignored `pause()`, so it
 * fired while a dialog was open. Zoom now lives here alone.
 */
const captureShortcuts = (designer: Designer): Registered => {
  const registered: Registered = new Map();

  const instance = Object.create(DesignerKeyboard.prototype) as DesignerKeyboard & {
    addShortcut: (keys: string[] | string, callback: () => void) => void;
  };
  instance.addShortcut = (keys, callback) => {
    (Array.isArray(keys) ? keys : [keys]).forEach((key) => registered.set(key, callback));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (DesignerKeyboard.prototype as any)._registerEvents.call(instance, designer);
  return registered;
};

describe('DesignerKeyboard zoom shortcuts', () => {
  let designer: Designer;
  let shortcuts: Registered;

  beforeEach(() => {
    designer = {
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      zoomToFit: jest.fn(),
      getModel: jest.fn().mockReturnValue({
        selectedTopic: jest.fn().mockReturnValue(undefined),
        filterSelectedTopics: jest.fn().mockReturnValue([]),
        getTopics: jest.fn().mockReturnValue([]),
      }),
      getMindmap: jest.fn(),
      deselectAll: jest.fn(),
      selectAll: jest.fn(),
      copyToClipboard: jest.fn(),
      pasteClipboard: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
      createSiblingForSelectedNode: jest.fn(),
      createChildForSelectedNode: jest.fn(),
      deleteSelectedEntities: jest.fn(),
      changeFontWeight: jest.fn(),
      changeFontStyle: jest.fn(),
      shrinkSelectedBranch: jest.fn(),
      getWidgetManager: jest.fn().mockReturnValue({ fireEvent: jest.fn() }),
      getContainer: jest.fn().mockReturnValue(document.createElement('div')),
    } as unknown as Designer;

    shortcuts = captureShortcuts(designer);
  });

  it.each([
    ['meta+=', 'zoomIn'],
    ['ctrl+=', 'zoomIn'],
    ['meta+plus', 'zoomIn'],
    ['ctrl+plus', 'zoomIn'],
    ['meta+-', 'zoomOut'],
    ['ctrl+-', 'zoomOut'],
    ['meta+0', 'zoomToFit'],
    ['ctrl+0', 'zoomToFit'],
  ] as [string, 'zoomIn' | 'zoomOut' | 'zoomToFit'][])('binds %s to %s', (key, method) => {
    const callback = shortcuts.get(key);
    expect(callback).toBeDefined();

    callback!();

    expect(designer[method]).toHaveBeenCalledTimes(1);
    (['zoomIn', 'zoomOut', 'zoomToFit'] as const)
      .filter((m) => m !== method)
      .forEach((other) => expect(designer[other]).not.toHaveBeenCalled());
  });

  it('registers zoom-to-fit, which the editor toolbar used to own alone', () => {
    expect(shortcuts.has('meta+0')).toBe(true);
    expect(shortcuts.has('ctrl+0')).toBe(true);
  });
});
