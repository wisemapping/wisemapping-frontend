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

jest.mock('../../../src/components/SvgImageIcon', () => ({
  __esModule: true,
  default: class MockSvgImageIcon {},
}));
jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import { buildDesigner } from './designer-harness';

// A is collapsed: its child A1 is hidden.
const MAP = [
  '<map name="collapsed" version="tango">',
  '  <topic id="0" central="true" text="Central">',
  '    <topic id="1" text="A" position="200,-50" order="0" shrink="true">',
  '      <topic id="2" text="A1" position="350,-50" order="0"/>',
  '    </topic>',
  '    <topic id="3" text="B" position="-200,50" order="1"/>',
  '  </topic>',
  '</map>',
].join('\n');

/**
 * Adding a topic under a collapsed parent expands the parent so the new topic
 * is visible, and that is part of the same undo step as the add.
 */
describe('AddTopicCommand undo/redo', () => {
  const createChild = (designer: Awaited<ReturnType<typeof buildDesigner>>['designer']) => {
    const model = designer.getMindmap().createNode('MainTopic');
    model.setText('A2');
    model.setPosition(350, 0);
    model.setOrder(1);
    return model;
  };

  it('expands a collapsed parent, and one undo collapses it again', async () => {
    const { designer, save, topic } = await buildDesigner(MAP);
    expect(topic(1).areChildrenShrunken()).toBe(true);
    const before = save();

    const model = createChild(designer);
    designer.getActionDispatcher().addTopics([model], [1]);
    const after = save();
    expect(topic(1).areChildrenShrunken()).toBe(false);
    expect(topic(model.getId()).getParent()?.getId()).toBe(1);

    designer.undo();
    expect(designer.getModel().findTopicById(model.getId())).toBeUndefined();
    expect(topic(1).areChildrenShrunken()).toBe(true);
    expect(save()).toEqual(before);

    designer.redo();
    expect(topic(1).areChildrenShrunken()).toBe(false);
    expect(save()).toEqual(after);
  });

  it('expands every collapsed parent once when pasting several topics', async () => {
    const { designer, save, topic } = await buildDesigner(MAP);
    const before = save();

    const first = createChild(designer);
    const second = createChild(designer);
    second.setOrder(2);
    designer.getActionDispatcher().addTopics([first, second], [1, 1]);
    expect(topic(1).areChildrenShrunken()).toBe(false);

    designer.undo();
    expect(topic(1).areChildrenShrunken()).toBe(true);
    expect(save()).toEqual(before);
  });

  it('leaves an expanded parent as it was', async () => {
    const { designer, save, topic } = await buildDesigner(MAP);
    const before = save();

    const model = createChild(designer);
    designer.getActionDispatcher().addTopics([model], [3]);
    expect(topic(3).areChildrenShrunken()).toBe(false);
    expect(topic(1).areChildrenShrunken()).toBe(true);

    designer.undo();
    expect(topic(3).areChildrenShrunken()).toBe(false);
    expect(save()).toEqual(before);
  });
});
