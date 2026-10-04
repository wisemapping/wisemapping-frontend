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

import EventBusDispatcher from '../../../src/components/layout/EventBusDispatcher';
import LayoutEventBus from '../../../src/components/layout/LayoutEventBus';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import Mindmap from '../../../src/components/model/Mindmap';

describe('EventBusDispatcher payloads (BL4-35)', () => {
  let dispatcher: EventBusDispatcher;

  afterEach(() => {
    dispatcher?.dispose();
  });

  it('drives the layout with the topic models the bus sends', () => {
    const mindmap = new Mindmap();
    const central = mindmap.createNode('CentralTopic', 0);
    mindmap.addBranch(central);
    const child = mindmap.createNode('MainTopic', 1);
    child.setPosition(100, 0);
    child.connectTo(central);

    const manager = new LayoutManager(0, { width: 100, height: 40 });
    dispatcher = new EventBusDispatcher();
    dispatcher.setLayoutManager(manager);

    LayoutEventBus.fireEvent('topicAdded', child);
    LayoutEventBus.fireEvent('topicResize', { node: child, size: { width: 60, height: 20 } });
    LayoutEventBus.fireEvent('topicConnected', { parentNode: central, childNode: child });

    // The model had no order: it gets the next one among its siblings.
    expect(child.getOrder()).toBe(0);
    expect(manager.find(1).getSize()).toEqual({ width: 60, height: 20 });
    expect(manager.find(1).getOrder()).toBe(0);

    LayoutEventBus.fireEvent('topicDisconect', child);
    LayoutEventBus.fireEvent('topicRemoved', child);
    expect(() => manager.find(1)).toThrow();
  });

  it('types each event with the payload the bus sends', () => {
    const mindmap = new Mindmap();
    const model = mindmap.createNode('MainTopic', 1);
    const notAModel = { getId: () => 1 };

    // Never run: ts-jest type-checks the tests, so these fail to compile while fireEvent takes any
    // payload.
    const typeChecks = () => {
      LayoutEventBus.fireEvent('topicRemoved', model);
      LayoutEventBus.fireEvent('forceLayout');
      // @ts-expect-error topics are sent as their model
      LayoutEventBus.fireEvent('topicRemoved', notAModel);
      // @ts-expect-error topicMoved needs a position
      LayoutEventBus.fireEvent('topicMoved', { node: model });
      // @ts-expect-error topicConnected needs its payload
      LayoutEventBus.fireEvent('topicConnected');
    };
    expect(typeChecks).toBeInstanceOf(Function);
  });
});
