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

import ChangeEvent from '../../../src/components/layout/ChangeEvent';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import Node from '../../../src/components/layout/Node';
import RootedTreeSet from '../../../src/components/layout/RootedTreeSet';

/*
 * Layout lookups must not grow with the size of the map. These tests count the work, never the
 * time. Each bound fails on the code from before the lookups were indexed; the counts it had are
 * noted next to each one.
 */

const NODES = 500;
const SIZE = { width: 60, height: 20 };
const ORIGIN = { x: 0, y: 0 };

/** The ids of layout nodes read: a search of the tree reads the id of each node it visits. */
const spyOnTreeVisits = () => jest.spyOn(Node.prototype, 'getId');

describe('Layout lookups', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('finds a node of a deep tree directly', () => {
    const manager = new LayoutManager(0, { width: 100, height: 40 });
    for (let id = 1; id < NODES; id++) {
      manager.addNode(id, SIZE, ORIGIN).connectNode(id - 1, id, 0);
    }
    const visits = spyOnTreeVisits();

    for (let id = 0; id < NODES; id++) {
      expect(manager.find(id).getId()).toBe(id);
    }

    // Before: 125,250 visits, the depth of each node. Now only the test's own getId.
    expect(visits).toHaveBeenCalledTimes(NODES);
  });

  it('keeps finding the nodes that are reachable, and only those', () => {
    const manager = new LayoutManager(0, { width: 100, height: 40 });
    // 0 ── 1 ── 2 ── 3, and 4 on its own.
    [1, 2, 3, 4].forEach((id) => manager.addNode(id, SIZE, ORIGIN));
    manager.connectNode(0, 1, 0).connectNode(1, 2, 0).connectNode(2, 3, 0);

    manager.disconnectNode(2);
    expect(manager.find(2).getId()).toBe(2);
    expect(manager.find(3).getId()).toBe(3);
    manager.connectNode(4, 2, 0);
    expect(manager.find(3).getId()).toBe(3);

    // Removing a node drops its whole branch: the branch is not reachable any more ...
    manager.removeNode(2);
    expect(() => manager.find(2)).toThrow('node could not be found');
    expect(() => manager.find(3)).toThrow('node could not be found');
    expect(manager.find(4).getId()).toBe(4);

    // ... so its ids can be used again.
    manager.addNode(3, SIZE, ORIGIN).connectNode(4, 3, 0);
    expect(manager.find(3).getId()).toBe(3);
    expect(() => manager.addNode(3, SIZE, ORIGIN)).toThrow('node already exits');
    // A lookup that does not validate answers null, as before.
    expect(new RootedTreeSet().find(1, false)).toBeNull();
  });

  it('collects the changes of a layout without searching the pending ones', () => {
    const manager = new LayoutManager(0, { width: 100, height: 40 });
    for (let id = 1; id < NODES; id++) {
      const parent = id < 10 ? 0 : Math.floor(id / 10);
      const order = id < 10 ? id - 1 : id % 10;
      manager.addNode(id, SIZE, ORIGIN).connectNode(parent, id, order);
    }
    const getId = jest.spyOn(ChangeEvent.prototype, 'getId');
    const changes: number[] = [];
    manager.addEvent('change', (event: ChangeEvent) => changes.push(event.getId()));

    manager.layout(true);

    expect(changes).toHaveLength(NODES);
    // Before: 125,250, a search of the pending changes for each one. Now the listener's only.
    expect(getId).toHaveBeenCalledTimes(NODES);
  });

  it('updates the pending change of a node when a layout is not flushed', () => {
    const manager = new LayoutManager(0, { width: 100, height: 40 });
    manager.addNode(1, SIZE, ORIGIN).connectNode(0, 1, 0);
    const changes: ChangeEvent[] = [];
    manager.addEvent('change', (event: ChangeEvent) => changes.push(event));

    manager.layout();
    manager.addNode(2, SIZE, ORIGIN).connectNode(0, 2, 1);
    manager.layout(true);

    // The change of node 1 is the same event, updated by the second layout.
    const first = changes.filter((event) => event.getId() === 1);
    expect(first.length).toBeGreaterThan(0);
    expect(new Set(first).size).toBe(1);
    expect(first[0].getPosition()).toEqual(manager.find(1).getPosition());

    // A flush starts afresh.
    changes.length = 0;
    manager.updateNodeSize(2, { width: 200, height: 80 });
    manager.layout(true);
    changes.forEach((event) => expect(first).not.toContain(event));
  });
});
