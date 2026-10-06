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
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';

// BL5-189: Mindmap.findNodeById walked the branches on every call, so R lookups cost R·N. It now
// keeps an id index, rebuilt after the tree or an id changes (add, remove, reparent, setId).

// A central topic with `count` main topics, each with one child: 1 + 2 * count nodes.
const buildMap = (count: number) => {
  const mindmap = new Mindmap();
  const central = mindmap.createNode('CentralTopic', 1000);
  mindmap.addBranch(central);
  const ids: number[] = [central.getId()];
  for (let i = 0; i < count; i++) {
    const main = mindmap.createNode('MainTopic', 2000 + i);
    const child = mindmap.createNode('MainTopic', 3000 + i);
    main.append(child);
    central.append(main);
    ids.push(main.getId(), child.getId());
  }
  return { mindmap, central, ids };
};

describe('Mindmap.findNodeById index (BL5-189)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reads each node once for many lookups, not once per lookup', () => {
    const { mindmap, ids } = buildMap(100);
    const getId = jest.spyOn(NodeModel.prototype, 'getId');

    ids.forEach((id) => expect(mindmap.findNodeById(id)?.getId()).toBe(id));

    // One walk of the 201 nodes builds the index; each lookup then reads the id of the node it
    // found (the two getId calls of the expect included). The walk per lookup read ~20 000.
    expect(getId.mock.calls.length).toBeLessThanOrEqual(ids.length * 4);
  });

  it('finds a node added after a lookup, and not one removed', () => {
    const { mindmap, central } = buildMap(3);
    expect(mindmap.findNodeById(42)).toBeUndefined();

    const added = mindmap.createNode('MainTopic', 42);
    central.append(added);
    expect(mindmap.findNodeById(42)).toBe(added);

    central.removeChild(added);
    expect(mindmap.findNodeById(42)).toBeUndefined();
  });

  it('finds the children of a branch added with them, and of an isolated branch removed', () => {
    const { mindmap } = buildMap(1);
    const isolated = mindmap.createNode('MainTopic', 50);
    const child = mindmap.createNode('MainTopic', 51);
    isolated.append(child);
    expect(mindmap.findNodeById(51)).toBeUndefined();

    mindmap.addBranch(isolated);
    expect(mindmap.findNodeById(51)).toBe(child);

    mindmap.removeBranch(isolated);
    expect(mindmap.findNodeById(51)).toBeUndefined();
  });

  it('follows a node to its new parent, and a node whose id changed', () => {
    const { mindmap, central } = buildMap(2);
    const node = mindmap.findNodeById(3000)!;
    node.getParent()!.removeChild(node);
    central.append(node);
    expect(mindmap.findNodeById(3000)).toBe(node);

    node.setId(77);
    expect(mindmap.findNodeById(3000)).toBeUndefined();
    expect(mindmap.findNodeById(77)).toBe(node);
  });

  it('finds the first of two nodes with the same id, as the walk did, and nothing for NaN', () => {
    const { mindmap, central } = buildMap(1);
    const duplicate = mindmap.createNode('MainTopic', 2000);
    central.append(duplicate);

    expect(mindmap.findNodeById(2000)).toBe(central.getChildren()[0]);
    expect(mindmap.findNodeById(Number.NaN)).toBeUndefined();
  });
});
