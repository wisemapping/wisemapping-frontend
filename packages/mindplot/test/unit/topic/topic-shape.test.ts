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

import MainTopic from '../../../src/components/MainTopic';
import { buildTopics, stubSvgMeasurement } from './Helper';

beforeAll(() => {
  stubSvgMeasurement();
});

describe('Topic.updateTopicShape for line topics', () => {
  it('reports the line type, so a redraw keeps the same inner shape', () => {
    const { child } = buildTopics();
    expect(child.getShapeType()).toBe('line');

    const innerShape = child.getInnerShape();
    expect(innerShape.getShapeType()).toBe('line');

    expect(child.updateTopicShape()).toBe(false);
    child.redraw(child.getThemeVariant(), false);
    expect(child.getInnerShape()).toBe(innerShape);
  });

  it('does not redraw the subtree when nothing changed', () => {
    const { mindmap, child, canvas } = buildTopics();
    const grandChildModel = mindmap.createNode('MainTopic', 3);
    grandChildModel.setPosition(350, 0);
    const grandChild = new MainTopic(grandChildModel, { readOnly: true }, 'light');
    grandChild.addToWorkspace(canvas);
    grandChild.connectTo(child, canvas);

    const spy = jest.spyOn(grandChild, 'redraw');
    child.redraw(child.getThemeVariant(), false);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('CentralTopic.updateTopicShape', () => {
  it('applies a shape change on the central topic', () => {
    const { central } = buildTopics();
    expect(central.getInnerShape().getShapeType()).not.toBe('rectangle');

    central.setShapeType('rectangle');

    expect(central.getShapeType()).toBe('rectangle');
    expect(central.getInnerShape().getShapeType()).toBe('rectangle');
  });

  it('does not redraw every child when the central topic is redrawn unchanged', () => {
    const { central, child } = buildTopics();

    const spy = jest.spyOn(child, 'redraw');
    central.redraw(central.getThemeVariant(), false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('still redraws the children when the central shape changes', () => {
    const { central, child } = buildTopics();

    const spy = jest.spyOn(child, 'redraw');
    central.setShapeType('elipse');
    expect(central.getInnerShape().getShapeType()).toBe('elipse');
    expect(spy).toHaveBeenCalled();
  });
});
