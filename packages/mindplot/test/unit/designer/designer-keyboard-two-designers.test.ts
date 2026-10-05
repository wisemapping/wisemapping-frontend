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
import { buildDesigner, Harness } from '../commands/designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const hover = (harness: Harness): void => {
  harness.designer.getContainer().dispatchEvent(new MouseEvent('mouseenter'));
};

const press = (type: 'keydown' | 'keypress', key: string, code = key): void => {
  document.dispatchEvent(new KeyboardEvent(type, { key, code, bubbles: true }));
};

// BL5-180: the shortcuts went to the keyboard registered last, whichever map was in use.
describe('DesignerKeyboard with two designers on the page', () => {
  let first: Harness;
  let second: Harness;

  beforeEach(async () => {
    first = await buildDesigner();
    second = await buildDesigner();
    first.designer.goToNode(first.topic(1));
    second.designer.goToNode(second.topic(1));
  });

  afterEach(() => {
    [first, second].forEach((harness) => harness.designer.dispose());
    jest.restoreAllMocks();
  });

  it('sends a shortcut to the designer the pointer is over', () => {
    const firstDelete = jest
      .spyOn(first.designer, 'deleteSelectedEntities')
      .mockImplementation(() => undefined);
    const secondDelete = jest
      .spyOn(second.designer, 'deleteSelectedEntities')
      .mockImplementation(() => undefined);

    hover(first);
    press('keydown', 'Delete');
    expect(firstDelete).toHaveBeenCalledTimes(1);
    expect(secondDelete).not.toHaveBeenCalled();

    hover(second);
    press('keydown', 'Delete');
    expect(firstDelete).toHaveBeenCalledTimes(1);
    expect(secondDelete).toHaveBeenCalledTimes(1);
  });

  it('types into the selected topic of that designer only', () => {
    const firstEdit = jest.spyOn(first.topic(1), 'showTextEditor').mockImplementation(() => {});
    const secondEdit = jest.spyOn(second.topic(1), 'showTextEditor').mockImplementation(() => {});

    hover(first);
    press('keypress', 'a', 'KeyA');

    expect(firstEdit).toHaveBeenCalledWith('a');
    expect(secondEdit).not.toHaveBeenCalled();
  });

  it('keeps the shortcuts of a designer when the other one is disposed', () => {
    const firstDelete = jest
      .spyOn(first.designer, 'deleteSelectedEntities')
      .mockImplementation(() => undefined);

    second.designer.dispose();
    hover(first);
    press('keydown', 'Delete');

    expect(firstDelete).toHaveBeenCalledTimes(1);
  });

  it('sends a shortcut added by the web component to its own designer', () => {
    const firstSave = jest.fn();
    const secondSave = jest.fn();
    first.designer.getKeyboard()!.addShortcut(['ctrl+s'], firstSave);
    second.designer.getKeyboard()!.addShortcut(['ctrl+s'], secondSave);

    hover(first);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));

    expect(firstSave).toHaveBeenCalledTimes(1);
    expect(secondSave).not.toHaveBeenCalled();
  });
});

// BL5-181: the document keydown listener was added once per page and never removed.
describe('DesignerKeyboard document listener', () => {
  it('is removed once the last designer is disposed', async () => {
    const added: EventListenerOrEventListenerObject[] = [];
    const removed: EventListenerOrEventListenerObject[] = [];
    const add = jest.spyOn(document, 'addEventListener').mockImplementation(function spy(
      this: Document,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (type === 'keydown') added.push(listener);
      EventTarget.prototype.addEventListener.call(this, type, listener, options);
    });
    const remove = jest.spyOn(document, 'removeEventListener').mockImplementation(function spy(
      this: Document,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ) {
      if (type === 'keydown') removed.push(listener);
      EventTarget.prototype.removeEventListener.call(this, type, listener, options);
    });

    const harnesses = [await buildDesigner(), await buildDesigner()];
    expect(added.length).toBeGreaterThan(0);
    harnesses[0].designer.dispose();
    expect(added.filter((listener) => !removed.includes(listener)).length).toBeGreaterThan(0);
    harnesses[1].designer.dispose();

    expect(added.filter((listener) => !removed.includes(listener))).toEqual([]);
    add.mockRestore();
    remove.mockRestore();
  });
});
