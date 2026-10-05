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

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import fs from 'fs';
import path from 'path';
import { buildDesigner } from '../commands/designer-harness';
import { buildMediumMap, layoutOf, useTextSizedBoxes } from './medium-map';

/**
 * Pins where the layout puts every topic of a medium map: after a load, and after the
 * interactive operations that connect, move, remove and restore topics. The snapshots were taken
 * before the map load was optimised (one layout per load instead of one per connected topic, and
 * indexed lookups), so they prove the optimisation did not move anything.
 */
describe('Layout of a whole map', () => {
  let restoreBoxes: () => void;

  beforeAll(() => {
    restoreBoxes = useTextSizedBoxes();
  });

  afterAll(() => {
    restoreBoxes();
  });

  beforeEach(() => {
    // Topics saved without an order, and order repairs, are reported on the console.
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const exportInput = (name: string): string =>
    fs.readFileSync(path.join(__dirname, '..', 'export', 'input', name), 'utf8');

  it.each(['complex.wxml', 'bug3.wxml'])('places every topic of %s', async (name) => {
    const { designer } = await buildDesigner(exportInput(name));
    expect(layoutOf(designer)).toMatchSnapshot();
  });

  it('places every topic of a 500-topic map in the tree layout', async () => {
    const { designer } = await buildDesigner(buildMediumMap({ layout: 'tree' }));
    expect(layoutOf(designer)).toMatchSnapshot();
  });

  it('places every topic of a 500-topic map, through edits, undo and redo', async () => {
    const { designer, topic } = await buildDesigner(buildMediumMap());
    const dispatcher = designer.getActionDispatcher();
    expect(designer.getModel().getTopics()).toHaveLength(500);
    expect(layoutOf(designer)).toMatchSnapshot('loaded');

    // Add a child: the topic is connected and laid out ...
    const model = designer.getMindmap().createNode('MainTopic');
    model.setText('Added child');
    model.setPosition(0, 0);
    model.setOrder(0);
    dispatcher.addTopics([model], [7]);
    expect(layoutOf(designer)).toMatchSnapshot('child added');

    // Drag a branch onto another parent ...
    const dragged = topic(40);
    dispatcher.dragTopic(40, dragged.getPosition(), 0, topic(5));
    expect(layoutOf(designer)).toMatchSnapshot('branch dragged');

    // Move a floating topic, with its children ...
    dispatcher.moveTopic(2, { x: 900, y: -250 });
    expect(layoutOf(designer)).toMatchSnapshot('floating topic moved');

    // Delete a branch, and a floating topic ...
    const branch = designer
      .getModel()
      .getTopics()
      .find((candidate) => candidate.getChildren().length > 2 && candidate.getId() > 10)!;
    dispatcher.deleteEntities([branch.getId(), 3], []);
    expect(layoutOf(designer)).toMatchSnapshot('branches deleted');

    // Collapse a branch ...
    dispatcher.shrinkBranch([5], true);
    expect(layoutOf(designer)).toMatchSnapshot('branch collapsed');

    // Undo it all: the restored branches are rebuilt topic by topic ...
    designer.undo();
    designer.undo();
    expect(layoutOf(designer)).toMatchSnapshot('delete undone');
    designer.undo();
    designer.undo();
    designer.undo();
    expect(layoutOf(designer)).toMatchSnapshot('all undone');

    designer.redo();
    designer.redo();
    designer.redo();
    designer.redo();
    designer.redo();
    expect(layoutOf(designer)).toMatchSnapshot('all redone');

    dispatcher.changeLayout('tree');
    expect(layoutOf(designer)).toMatchSnapshot('tree layout');
    dispatcher.changeLayout('mindmap');
    expect(layoutOf(designer)).toMatchSnapshot('mindmap layout again');
  });
});
