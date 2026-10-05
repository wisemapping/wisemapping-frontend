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

/**
 * A connection asks for a layout instead of running one: the next forceLayout, the end of a batch
 * or, at the latest, a microtask runs a single layout for all the connections before it.
 */
describe('EventBusDispatcher layout coalescing', () => {
  let dispatcher: EventBusDispatcher;

  afterEach(() => {
    dispatcher?.dispose();
    jest.restoreAllMocks();
  });

  const setUp = (children: number) => {
    const mindmap = new Mindmap();
    const central = mindmap.createNode('CentralTopic', 0);
    mindmap.addBranch(central);
    const models = Array.from({ length: children }, (_, i) => {
      const child = mindmap.createNode('MainTopic', i + 1);
      child.setPosition(100, 0);
      child.setOrder(i);
      child.connectTo(central);
      return child;
    });
    const manager = new LayoutManager(0, { width: 100, height: 40 });
    dispatcher = new EventBusDispatcher();
    dispatcher.setLayoutManager(manager);
    const layout = jest.spyOn(manager, 'layout');
    const connect = (child: (typeof models)[number]) => {
      LayoutEventBus.fireEvent('topicAdded', child);
      LayoutEventBus.fireEvent('topicConnected', { parentNode: central, childNode: child });
    };
    return { manager, models, layout, connect };
  };

  const microtasks = () =>
    new Promise<void>((resolve) => {
      queueMicrotask(resolve);
    });

  it('lays out once for a run of connections, in a microtask', async () => {
    const { manager, models, layout, connect } = setUp(5);
    models.forEach(connect);
    expect(layout).not.toHaveBeenCalled();
    // The tree is connected already: only positions wait for the layout.
    expect(manager.find(5).getOrder()).toBe(4);

    await microtasks();
    expect(layout).toHaveBeenCalledTimes(1);
    expect(layout).toHaveBeenCalledWith(true);

    await microtasks();
    expect(layout).toHaveBeenCalledTimes(1);
  });

  it('lets forceLayout run the layout a connection asked for, synchronously', async () => {
    const { manager, models, layout, connect } = setUp(2);
    const changes: number[] = [];
    manager.addEvent('change', (event: { getId: () => number }) => changes.push(event.getId()));

    // What Topic.connectTo does: topicConnected, then forceLayout ...
    connect(models[0]);
    LayoutEventBus.fireEvent('forceLayout');
    expect(layout).toHaveBeenCalledTimes(1);
    expect(changes).toContain(1);

    await microtasks();
    expect(layout).toHaveBeenCalledTimes(1);
  });

  it('holds connections back for a batch, and lays out once at its end', async () => {
    const { models, layout, connect } = setUp(4);
    dispatcher.beginBatch();
    connect(models[0]);
    dispatcher.beginBatch();
    connect(models[1]);
    dispatcher.endBatch();
    connect(models[2]);
    await microtasks();
    expect(layout).not.toHaveBeenCalled();

    dispatcher.endBatch();
    expect(layout).toHaveBeenCalledTimes(1);

    // An unmatched end does nothing, and a batch without connections does not lay out.
    dispatcher.endBatch();
    dispatcher.beginBatch();
    dispatcher.endBatch();
    expect(layout).toHaveBeenCalledTimes(1);

    connect(models[3]);
    await microtasks();
    expect(layout).toHaveBeenCalledTimes(2);
  });

  it('drops a pending layout when given another layout manager', async () => {
    const { models, layout, connect } = setUp(1);
    connect(models[0]);
    const other = new LayoutManager(0, { width: 100, height: 40 });
    const otherLayout = jest.spyOn(other, 'layout');
    dispatcher.setLayoutManager(other);

    await microtasks();
    expect(layout).not.toHaveBeenCalled();
    expect(otherLayout).not.toHaveBeenCalled();
  });

  it('drops a pending layout, and any batch, when disposed', async () => {
    const { models, layout, connect } = setUp(1);
    dispatcher.beginBatch();
    connect(models[0]);
    dispatcher.dispose();
    dispatcher.endBatch();

    await microtasks();
    expect(layout).not.toHaveBeenCalled();
  });
});

/**
 * BL5-94: forceLayout skips the layout when nothing it depends on changed since the last one (it
 * would move nothing), and runs it after any change.
 */
describe('EventBusDispatcher forceLayout with nothing pending', () => {
  let dispatcher: EventBusDispatcher;

  afterEach(() => {
    dispatcher?.dispose();
    jest.restoreAllMocks();
  });

  const setUp = () => {
    const mindmap = new Mindmap();
    const central = mindmap.createNode('CentralTopic', 0);
    mindmap.addBranch(central);
    const child = mindmap.createNode('MainTopic', 1);
    child.setPosition(100, 0);
    child.setOrder(0);
    child.connectTo(central);
    const manager = new LayoutManager(0, { width: 100, height: 40 });
    dispatcher = new EventBusDispatcher();
    dispatcher.setLayoutManager(manager);
    LayoutEventBus.fireEvent('topicAdded', child);
    LayoutEventBus.fireEvent('topicConnected', { parentNode: central, childNode: child });
    LayoutEventBus.fireEvent('forceLayout');
    const layout = jest.spyOn(manager, 'layout');
    return { manager, central, child, layout };
  };

  it('does not lay out again when nothing changed', () => {
    const { layout } = setUp();
    LayoutEventBus.fireEvent('forceLayout');
    LayoutEventBus.fireEvent('forceLayout');
    expect(layout).not.toHaveBeenCalled();
  });

  it('lays out after a change of size, shrink state or position, and only once', () => {
    const { manager, central, child, layout } = setUp();
    const before = manager.find(1).getPosition().x;

    LayoutEventBus.fireEvent('topicResize', { node: central, size: { width: 300, height: 40 } });
    LayoutEventBus.fireEvent('forceLayout');
    expect(layout).toHaveBeenCalledTimes(1);
    expect(manager.find(1).getPosition().x).toBeGreaterThan(before);
    LayoutEventBus.fireEvent('forceLayout');
    expect(layout).toHaveBeenCalledTimes(1);

    // A resize the layout does not see (half a pixel or less) changes nothing.
    LayoutEventBus.fireEvent('topicResize', { node: central, size: { width: 300.5, height: 40 } });
    LayoutEventBus.fireEvent('forceLayout');
    expect(layout).toHaveBeenCalledTimes(1);

    child.setChildrenShrunken(true);
    LayoutEventBus.fireEvent('childShrinked', child);
    LayoutEventBus.fireEvent('forceLayout');
    expect(layout).toHaveBeenCalledTimes(2);

    LayoutEventBus.fireEvent('topicMoved', { node: central, position: { x: 50, y: 0 } });
    LayoutEventBus.fireEvent('forceLayout');
    expect(layout).toHaveBeenCalledTimes(3);
  });

  it('lays out after a connection, a disconnection or a removal', () => {
    const { child, layout } = setUp();
    LayoutEventBus.fireEvent('topicDisconect', child);
    LayoutEventBus.fireEvent('forceLayout');
    expect(layout).toHaveBeenCalledTimes(1);

    LayoutEventBus.fireEvent('topicRemoved', child);
    LayoutEventBus.fireEvent('forceLayout');
    expect(layout).toHaveBeenCalledTimes(2);
  });

  it('flushes the changes a layout that was not flushed left', () => {
    const { manager, central, layout } = setUp();
    LayoutEventBus.fireEvent('topicResize', { node: central, size: { width: 300, height: 40 } });
    manager.layout(false);
    layout.mockClear();
    const changes: number[] = [];
    manager.addEvent('change', (event: { getId: () => number }) => changes.push(event.getId()));

    LayoutEventBus.fireEvent('forceLayout');
    expect(layout).toHaveBeenCalledTimes(1);
    expect(changes).toContain(1);
  });
});
