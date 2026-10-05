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

import DragTopic from '../../../src/components/DragTopic';
import MainTopic from '../../../src/components/MainTopic';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import { buildTopics, stubSvgMeasurement } from './Helper';
import { buildDesigner } from '../commands/designer-harness';
import type DragManager from '../../../src/components/DragManager';
import type DragPivot from '../../../src/components/DragPivot';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const layoutManager = {
  getOrientation: () => 'horizontal',
  predict: () => ({ order: 0, position: { x: 0, y: 0 } }),
} as unknown as LayoutManager;

beforeAll(() => {
  stubSvgMeasurement();
});

describe('NodeGraph.createDragNode (BL-74)', () => {
  it('builds a drag node from the drag shape of a main topic', () => {
    const { mindmap } = buildTopics();
    const floating = new MainTopic(
      mindmap.createNode('MainTopic', 3),
      { readOnly: false },
      'light',
    );

    const dragNode = floating.createDragNode(layoutManager);

    expect(dragNode).toBeInstanceOf(DragTopic);
    expect(dragNode.getDraggedTopic()).toBe(floating);
  });

  it('refuses to build a drag node without a shape for the central topic', () => {
    const { central } = buildTopics();

    expect(() => central.createDragNode(layoutManager)).toThrow(
      'CentralTopic has no drag shape: it can not be dragged',
    );
  });
});

// BL5-184: a drag node built outside a DragManager fell back to the pivot of the last workspace
// built, which a static kept alive after its designer was disposed.
describe('DragTopic pivot', () => {
  const pivotOf = (dragNode: DragTopic): DragPivot =>
    (dragNode as unknown as { _pivot: DragPivot })._pivot;

  it('does not use the pivot of a disposed designer', async () => {
    const { designer } = await buildDesigner();
    const designerPivot = (
      designer as unknown as { _dragManager: DragManager }
    )._dragManager.getDragPivot();
    designer.dispose();

    const { mindmap } = buildTopics();
    const floating = new MainTopic(
      mindmap.createNode('MainTopic', 3),
      { readOnly: false },
      'light',
    );
    const dragNode = floating.createDragNode(layoutManager);

    expect(pivotOf(dragNode)).not.toBe(designerPivot);
  });
});
