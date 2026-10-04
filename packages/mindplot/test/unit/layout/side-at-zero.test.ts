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
  default: class {},
}));

import { Group } from '@wisemapping/web2d';
import Canvas from '../../../src/components/Canvas';
import DesignerModel from '../../../src/components/DesignerModel';
import DragConnector from '../../../src/components/DragConnector';
import DragPivot from '../../../src/components/DragPivot';
import DragTopic from '../../../src/components/DragTopic';
import Topic from '../../../src/components/Topic';
import TopicConfig from '../../../src/components/TopicConfig';
import TopicConnection from '../../../src/components/TopicConnection';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import NodeGraph from '../../../src/components/NodeGraph';
import { sideOf } from '../../../src/components/util/side';

/**
 * Which side of the map something is on is decided in many places, and the rule is
 * x >= reference: right. `Math.sign(x)` is 0 at x === 0, which reads as neither
 * side and zeroes every offset multiplied by it; `x > reference` counts zero as the
 * left. Each case below sits at exactly the reference.
 */

const ROOT_NODE_SIZE = { width: 140, height: 90 };
const NODE_SIZE = { width: 80, height: 60 };
const ORIGIN = { x: 0, y: 0 };

describe('sideOf', () => {
  it('puts x === reference on the right', () => {
    expect(sideOf(0)).toBe(1);
    expect(sideOf(200, 200)).toBe(1);
  });

  it('tells the halves apart around the reference', () => {
    expect(sideOf(1)).toBe(1);
    expect(sideOf(-1)).toBe(-1);
    expect(sideOf(150, 200)).toBe(-1);
    expect(sideOf(-150, -200)).toBe(1);
  });
});

describe('SymmetricSorter: isolated topic at x === 0', () => {
  it('lays its children out to the right instead of on top of it', () => {
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);
    // Topic 5 is not connected to the central topic: it is the root of its own tree.
    manager.addNode(5, NODE_SIZE, { x: 0, y: 400 });
    manager.addNode(6, NODE_SIZE, ORIGIN).connectNode(5, 6, 0);
    manager.layout();

    const child = manager.find(6).getPosition();
    expect(child.x).toBe(NODE_SIZE.width / 2 + NODE_SIZE.width / 2 + 30);
  });

  it('gives its grandchildren the same side', () => {
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);
    manager.addNode(5, NODE_SIZE, { x: 0, y: 400 });
    manager.addNode(6, NODE_SIZE, ORIGIN).connectNode(5, 6, 0);
    manager.addNode(7, NODE_SIZE, ORIGIN).connectNode(6, 7, 0);
    manager.layout();

    expect(manager.find(7).getPosition().x).toBeGreaterThan(manager.find(6).getPosition().x);
  });
});

describe('BalancedSorter.predict', () => {
  it('puts a position at the root x on the right, as _getRelativeDirection does', () => {
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);

    const predicted = manager.predict(0, null, { x: 0, y: 0 });

    expect(predicted.order).toBe(0);
    expect(predicted.position.x).toBeGreaterThan(0);
  });

  /**
   * root (500, 0)
   * ├── 1 right (order 0)
   * └── 2 left  (order 1), still at x > 0
   */
  const buildOffOrigin = (rootX: number): LayoutManager => {
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);
    manager.moveNode(0, { x: rootX, y: 0 });
    manager.addNode(1, NODE_SIZE, ORIGIN).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, ORIGIN).connectNode(0, 2, 1);
    manager.layout();
    return manager;
  };

  it('inserts above the first left child of a root right of the origin on the left', () => {
    const manager = buildOffOrigin(500);
    const left = manager.find(2).getPosition();
    expect(left.x).toBeGreaterThan(0);
    expect(left.x).toBeLessThan(500);

    const predicted = manager.predict(0, null, { x: left.x, y: left.y - 200 });

    expect(predicted.order).toBe(1);
    expect(predicted.position.x).toBe(left.x);
  });

  it('inserts above the first right child of a root left of the origin on the right', () => {
    const manager = buildOffOrigin(-500);
    const right = manager.find(1).getPosition();
    expect(right.x).toBeLessThan(0);
    expect(right.x).toBeGreaterThan(-500);

    const predicted = manager.predict(0, null, { x: right.x, y: right.y - 200 });

    expect(predicted.order).toBe(0);
    expect(predicted.position.x).toBe(right.x);
  });
});

describe('TopicConnection: shrink connector of a parent at x === 0', () => {
  it('is placed on the right, where the children of the parent are', () => {
    const setPosition = jest.fn();
    const parent = {
      getPosition: () => ({ x: 0, y: 0 }),
      getSize: () => ({ width: 100, height: 40 }),
      getShrinkConnector: () => ({ setPosition }),
      getOrientation: () => 'horizontal',
      getShapeType: () => 'rectangle',
    } as unknown as Topic;
    const connection = Object.create(TopicConnection.prototype) as {
      _positionLine(parentTopic: Topic): void;
    };

    connection._positionLine(parent);

    expect(setPosition).toHaveBeenCalledWith(100, 20 - TopicConfig.CONNECTOR_WIDTH / 2);
  });
});

describe('DragConnector: dragging at x === 0', () => {
  const fakeTopic = (x: number, y: number, width = 60): Topic =>
    ({
      getPosition: () => ({ x, y }),
      getSize: () => ({ width, height: 30 }),
      areChildrenShrunken: () => false,
      isCollapsed: () => false,
    }) as unknown as Topic;

  const candidatesAt = (x: number, topics: Topic[]): Topic[] => {
    const dragged = {
      getOrientation: () => 'horizontal',
      isChildTopic: () => false,
    };
    const dragTopic = {
      getPosition: () => ({ x, y: 0 }),
      getDraggedTopic: () => dragged,
      getConnectedToTopic: () => null,
    } as unknown as DragTopic;
    const model = { getTopics: () => topics } as unknown as DesignerModel;
    const connector = new DragConnector(model, {} as Canvas) as unknown as {
      _searchConnectionCandidates(topic: DragTopic): Topic[];
    };
    return connector._searchConnectionCandidates(dragTopic);
  };

  it('finds a parent on the left, as for any x on the right half', () => {
    // Right border at -70: 70px to the left of the dragged topic.
    const parent = fakeTopic(-100, 0);

    expect(candidatesAt(1, [parent])).toEqual([parent]);
    expect(candidatesAt(0, [parent])).toEqual([parent]);
  });

  it('does not connect to a topic on its right', () => {
    expect(candidatesAt(0, [fakeTopic(100, 0)])).toEqual([]);
  });
});

describe('DragTopic: drag shadow at x === 0', () => {
  const shadowXAt = (x: number): number => {
    const setPosition = jest.fn();
    const shape = { setPosition } as unknown as Group;
    const dragged = { getSize: () => ({ width: 80, height: 30 }) } as unknown as NodeGraph;
    const layout = { getOrientation: () => 'horizontal' } as unknown as LayoutManager;
    const pivot = { getTargetTopic: () => null } as unknown as DragPivot;

    const dragTopic = DragTopic.withPivot(pivot, () => new DragTopic(shape, dragged, layout));
    dragTopic.setPosition(x, 0);
    return setPosition.mock.calls[0][0];
  };

  it('extends to the right, the side the layout and DragConnector use there', () => {
    expect(shadowXAt(1)).toBe(1);
    expect(shadowXAt(0)).toBe(0);
    expect(shadowXAt(-1)).toBe(-81);
  });
});
