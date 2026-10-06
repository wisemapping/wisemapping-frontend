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

import type Canvas from '../../../src/components/Canvas';
import CentralTopic from '../../../src/components/CentralTopic';
import MainTopic from '../../../src/components/MainTopic';
import Mindmap from '../../../src/components/model/Mindmap';

jest.mock('../../../src/components/SvgImageIcon', () => ({
  __esModule: true,
  default: class MockSvgImageIcon {},
}));

beforeAll(() => {
  // An empty text keeps the topics at their default size, so a new central topic is not
  // re-centred (CentralTopic.updatePositionOnChangeSize) and keeps having no position.
  (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () =>
    ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect;
});

const canvas = { append: jest.fn(), removeChild: jest.fn() } as unknown as Canvas;

describe('topics whose model has no position (BL4-34)', () => {
  it('works out the connection points of a central topic without a position', () => {
    const mindmap = new Mindmap();
    const centralModel = mindmap.createNode('CentralTopic', 1);

    // The Topic constructor only positions a central topic whose model has one.
    const central = new CentralTopic(centralModel, { readOnly: true }, 'light');
    expect(centralModel.hasPosition()).toBe(false);

    expect(central.getPosition()).toEqual({ x: 0, y: 0 });
    expect(central.workoutIncomingConnectionPoint({ x: 100, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(central.workoutOutgoingConnectionPoint({ x: 100, y: 0 }).y).toBe(0);
  });

  it('connects a main topic without a position, drawn at its parent position', () => {
    const mindmap = new Mindmap();
    const centralModel = mindmap.createNode('CentralTopic', 1);
    centralModel.setPosition(0, 0);
    mindmap.addBranch(centralModel);
    const central = new CentralTopic(centralModel, { readOnly: true }, 'light');
    central.addToWorkspace(canvas);

    const childModel = mindmap.createNode('MainTopic', 2);
    childModel.setPosition(200, 0);
    const child = new MainTopic(childModel, { readOnly: true }, 'light');
    child.addToWorkspace(canvas);
    child.connectTo(central, canvas);

    // The layout gives a new topic its position only after it is connected.
    const grandChildModel = mindmap.createNode('MainTopic', 3);
    const grandChild = new MainTopic(grandChildModel, { readOnly: true }, 'light');
    grandChild.addToWorkspace(canvas);

    expect(() => grandChild.connectTo(child, canvas)).not.toThrow();
    expect(grandChild.getPosition()).toEqual({ x: 200, y: 0 });
  });

  it('does not give a main topic a position just because its size changed', () => {
    const mindmap = new Mindmap();
    const model = mindmap.createNode('MainTopic', 2);
    const topic = new MainTopic(model, { readOnly: true }, 'light');

    topic.updatePositionOnChangeSize();

    expect(model.hasPosition()).toBe(false);
  });
});
