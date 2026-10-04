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

import { buildDesigner } from '../commands/designer-harness';
import Designer from '../../../src/components/Designer';
import PositionType from '../../../src/components/PositionType';
import WidgetBuilder from '../../../src/components/WidgetBuilder';
import LayoutEventBus from '../../../src/components/layout/LayoutEventBus';
import Mindmap from '../../../src/components/model/Mindmap';

/**
 * INodeModel.getPosition() is undefined when a topic has no position. The Tango loader fills
 * them in, but a map built in code (or by an importer) may not: rendering and the designer
 * must not dereference it.
 */

const loadMindmap = async (mindmap: Mindmap): Promise<Designer> => {
  LayoutEventBus.reset();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const designer = new Designer({
    zoom: 1,
    mode: 'edition-owner',
    divContainer: container,
    widgetManager: {} as WidgetBuilder,
  });
  await designer.loadMap(mindmap);
  return designer;
};

/**
 * Central (0, at the origin)
 * └── A (1), no position
 *     └── A1 (2), no position
 * Floating (3), no position
 */
const mapWithoutPositions = (): Mindmap => {
  const mindmap = new Mindmap('no-positions');
  const central = mindmap.createNode('CentralTopic', 0);
  central.setText('Central');
  central.setPosition(0, 0);
  mindmap.addBranch(central);

  const child = mindmap.createNode('MainTopic', 1);
  child.setText('A');
  central.append(child);
  const grandChild = mindmap.createNode('MainTopic', 2);
  grandChild.setText('A1');
  child.append(grandChild);

  const floating = mindmap.createNode('MainTopic', 3);
  floating.setText('Floating');
  mindmap.addBranch(floating);
  return mindmap;
};

describe('Topics without a position', () => {
  it('render, and the layout places them', async () => {
    const designer = await loadMindmap(mapWithoutPositions());

    const positionOf = (id: number) => designer.getModel().findTopicById(id)!.getPosition();
    // Connected topics are laid out on the right of their parent.
    expect(positionOf(1).x).toBeGreaterThan(0);
    expect(positionOf(2).x).toBeGreaterThan(positionOf(1).x);
    // A floating topic has no parent to take a position from: the origin.
    expect(positionOf(3)).toEqual({ x: 0, y: 0 });
  });

  it('do not break zoom to fit', async () => {
    const { designer, topic } = await buildDesigner();
    jest.spyOn(topic(5), 'getPosition').mockReturnValue(undefined as unknown as PositionType);

    expect(() => designer.zoomToFit()).not.toThrow();
  });

  it('can be pasted from a clipboard map', async () => {
    const { designer } = await buildDesigner();
    const clipboard = mapWithoutPositions();
    (designer as unknown as { _internalClipboard: string })._internalClipboard = '<map></map>';
    jest
      .spyOn(
        designer as unknown as { _parseClipboardMindmap: () => Mindmap },
        '_parseClipboardMindmap',
      )
      .mockReturnValue(clipboard);
    const before = designer.getModel().getTopics().length;

    await designer.pasteClipboard();

    // A and its child A1 are pasted.
    expect(designer.getModel().getTopics()).toHaveLength(before + 2);
  });
});
