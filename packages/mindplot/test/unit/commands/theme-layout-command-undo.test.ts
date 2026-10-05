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

import ChangeLayoutCommand from '../../../src/components/commands/ChangeLayoutCommand';
import ChangeThemeCommand from '../../../src/components/commands/ChangeThemeCommand';
import CommandContext from '../../../src/components/CommandContext';
import { buildDesigner } from './designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

describe('ChangeThemeCommand undo/redo', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('changes the theme, and undo restores the previous one in the saved map', async () => {
    const { designer, save } = await buildDesigner();
    const before = save();
    expect(designer.getMindmap().getTheme()).toBe('classic');

    designer.changeTheme('ocean');
    const after = save();
    expect(designer.getMindmap().getTheme()).toBe('ocean');
    expect(after).toContain('theme="ocean"');

    designer.undo();
    expect(designer.getMindmap().getTheme()).toBe('classic');
    expect(save()).toEqual(before);

    designer.redo();
    expect(designer.getMindmap().getTheme()).toBe('ocean');
    expect(save()).toEqual(after);
  });

  it('undoes two theme changes one at a time', async () => {
    const { designer } = await buildDesigner();
    designer.changeTheme('robot');
    designer.changeTheme('sunrise');

    designer.undo();
    expect(designer.getMindmap().getTheme()).toBe('robot');
    designer.undo();
    expect(designer.getMindmap().getTheme()).toBe('classic');
  });

  it('refuses to be applied, or undone, twice in a row', async () => {
    const { designer } = await buildDesigner();
    const context = new CommandContext(designer);
    const command = new ChangeThemeCommand('prism');

    expect(() => command.undoExecute(context)).toThrow('undo can not be applied');
    command.execute(context);
    expect(() => command.execute(context)).toThrow('two times in a row');
    command.undoExecute(context);
    expect(designer.getMindmap().getTheme()).toBe('classic');
    expect(() => command.undoExecute(context)).toThrow('undo can not be applied');
  });
});

describe('ChangeLayoutCommand undo/redo', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('switches to the tree layout, and undo goes back to the mind map layout', async () => {
    const { designer, save, topic } = await buildDesigner();
    const before = save();
    expect(designer.getLayout()).toBe('mindmap');
    expect(topic(1).getOrientation()).toBe('horizontal');

    designer.changeLayout('tree');
    const after = save();
    expect(designer.getLayout()).toBe('tree');
    expect(after).toContain('layout="tree"');
    // Every topic follows the layout orientation, floating ones included.
    expect(topic(1).getOrientation()).toBe('vertical');
    expect(topic(5).getOrientation()).toBe('vertical');

    designer.undo();
    expect(designer.getLayout()).toBe('mindmap');
    expect(topic(1).getOrientation()).toBe('horizontal');
    expect(save()).toEqual(before);

    designer.redo();
    expect(designer.getLayout()).toBe('tree');
    expect(save()).toEqual(after);
  });

  it('refuses to be applied, or undone, twice in a row', async () => {
    const { designer } = await buildDesigner();
    const context = new CommandContext(designer);
    const command = new ChangeLayoutCommand('tree');

    expect(() => command.undoExecute(context)).toThrow('undo can not be applied');
    command.execute(context);
    expect(() => command.execute(context)).toThrow('two times in a row');
    command.undoExecute(context);
    expect(designer.getLayout()).toBe('mindmap');
    expect(() => command.undoExecute(context)).toThrow('undo can not be applied');
  });
});
