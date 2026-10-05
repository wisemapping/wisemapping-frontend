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

import { buildDesigner, SAMPLE_MAP } from './designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

describe('GenericFunctionCommand undo/redo', () => {
  it('restores each topic its own value after the model order changed', async () => {
    const { designer, save, topic } = await buildDesigner();
    const dispatcher = designer.getActionDispatcher();
    const before = save();

    dispatcher.changeTextToTopic([2, 3], 'Same');
    const afterText = save();

    // Undoing a delete re-adds the topic at the end of the designer model.
    dispatcher.deleteEntities([2], []);
    designer.undo();
    expect(save()).toEqual(afterText);

    designer.undo();
    expect(topic(2).getText()).toBe('A1');
    expect(topic(3).getText()).toBe('B');
    expect(save()).toEqual(before);

    designer.redo();
    expect(save()).toEqual(afterText);
  });
});

describe('color commands undo', () => {
  type Case = {
    name: string;
    apply: (ids: number[], color: string) => void;
    raw: (id: number) => string | undefined;
  };

  const cases = async (): Promise<{
    harness: Awaited<ReturnType<typeof buildDesigner>>;
    all: Case[];
  }> => {
    const harness = await buildDesigner();
    const dispatcher = harness.designer.getActionDispatcher();
    const model = (id: number) => harness.topic(id).getModel();
    const all: Case[] = [
      {
        name: 'font',
        apply: (ids, color) => dispatcher.changeFontColorToTopic(ids, color),
        raw: (id) => model(id).getFontColor(),
      },
      {
        name: 'background',
        apply: (ids, color) => dispatcher.changeBackgroundColorToTopic(ids, color),
        raw: (id) => model(id).getBackgroundColor(),
      },
      {
        name: 'border',
        apply: (ids, color) => dispatcher.changeBorderColorToTopic(ids, color),
        raw: (id) => model(id).getBorderColor(),
      },
      {
        name: 'connection',
        apply: (ids, color) => dispatcher.changeConnectionColorToTopic(ids, color),
        raw: (id) => model(id).getConnectionColor(),
      },
    ];
    return { harness, all };
  };

  it.each(['font', 'background', 'border', 'connection'])(
    'leaves a theme %s color unset after undo, so the topic keeps following the theme',
    async (name) => {
      const { harness, all } = await cases();
      const { designer, save } = harness;
      const target = all.find((c) => c.name === name)!;
      const before = save();
      expect(target.raw(1)).toBeUndefined();

      target.apply([1], '#ff0000');
      const after = save();
      expect(target.raw(1)).toBe('#ff0000');

      designer.undo();
      expect(target.raw(1)).toBeUndefined();
      expect(save()).toEqual(before);

      designer.redo();
      expect(save()).toEqual(after);
    },
  );
});

describe('shrinkBranch undo', () => {
  // A starts collapsed, B expanded.
  const map = SAMPLE_MAP.replace('text="A" ', 'text="A" shrink="true" ');

  it('keeps already collapsed branches collapsed when collapse-all is undone', async () => {
    const { designer, save, topic } = await buildDesigner(map);
    const before = save();
    expect(topic(1).areChildrenShrunken()).toBe(true);

    designer.collapseAllNodes();
    const after = save();
    expect(topic(3).areChildrenShrunken()).toBe(true);

    designer.undo();
    expect(topic(1).areChildrenShrunken()).toBe(true);
    expect(topic(3).areChildrenShrunken()).toBe(false);
    expect(save()).toEqual(before);

    designer.redo();
    expect(save()).toEqual(after);
  });

  it('keeps already expanded branches expanded when expand-all is undone', async () => {
    const { designer, save, topic } = await buildDesigner(map);
    const before = save();

    designer.expandAllNodes();
    const after = save();
    expect(topic(1).areChildrenShrunken()).toBe(false);

    designer.undo();
    expect(topic(1).areChildrenShrunken()).toBe(true);
    expect(topic(3).areChildrenShrunken()).toBe(false);
    expect(save()).toEqual(before);

    designer.redo();
    expect(save()).toEqual(after);
  });
});

describe('changeTextToTopic undo', () => {
  // A1 has no text of its own: the canvas shows the theme placeholder.
  const map = SAMPLE_MAP.replace(' text="A1"', '');

  it('leaves a topic without text empty after undo, instead of storing the placeholder', async () => {
    const { designer, save, topic } = await buildDesigner(map);
    const before = save();
    expect(topic(2).getModel().getText()).toBeUndefined();
    const placeholder = topic(2).getText();

    designer.getActionDispatcher().changeTextToTopic([2], 'Edited');
    const after = save();
    expect(topic(2).getModel().getText()).toBe('Edited');

    designer.undo();
    expect(topic(2).getModel().getText()).toBeUndefined();
    expect(topic(2).getText()).toBe(placeholder);
    expect(save()).toEqual(before);

    designer.redo();
    expect(save()).toEqual(after);
  });
});
