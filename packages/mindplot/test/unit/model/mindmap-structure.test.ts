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
import ContentType from '../../../src/components/ContentType';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';

/**
 * central (0)
 * └── a (1)
 *     └── a1 (2)
 *         └── a11 (3)
 * floating (4)
 */
const build = () => {
  const mindmap = Mindmap.buildEmpty('map');
  const central = mindmap.getCentralTopic() as NodeModel;
  const a = mindmap.createNode('MainTopic', 1);
  const a1 = mindmap.createNode('MainTopic', 2);
  const a11 = mindmap.createNode('MainTopic', 3);
  const floating = mindmap.createNode('MainTopic', 4);
  a.setText('a');
  [a, a1, a11, floating].forEach((node) => mindmap.addBranch(node));
  mindmap.connect(central, a);
  mindmap.connect(a, a1);
  mindmap.connect(a1, a11);
  return { mindmap, central, a, a1, a11, floating };
};

describe('Mindmap branches', () => {
  it('starts with the central topic, at the origin', () => {
    const mindmap = new Mindmap('map');
    const central = mindmap.createNode('CentralTopic', 0);
    central.setPosition(50, 60);
    mindmap.addBranch(central);
    expect(central.getPosition()).toEqual({ x: 0, y: 0 });
    expect(mindmap.getCentralTopic()).toBe(central);
  });

  it('accepts only one central topic, and it must come first', () => {
    const mindmap = new Mindmap('map');
    expect(() => mindmap.addBranch(mindmap.createNode('MainTopic', 1))).toThrow(
      'First element must be the central topic',
    );
    mindmap.addBranch(mindmap.createNode('CentralTopic', 0));
    expect(() => mindmap.addBranch(mindmap.createNode('CentralTopic', 2))).toThrow(
      'Mindmaps only have one cental topic',
    );
  });

  it('connects a branch to a parent, and disconnects it back into a branch', () => {
    const { mindmap, central, a, floating } = build();
    expect(mindmap.getBranches()).toEqual([central, floating]);

    mindmap.disconnect(a);
    expect(a.getParent()).toBeNull();
    expect(central.getChildren()).toEqual([]);
    expect(mindmap.getBranches()).toEqual([central, floating, a]);

    mindmap.connect(floating, a);
    expect(a.getParent()).toBe(floating);
    expect(mindmap.getBranches()).toEqual([central, floating]);
  });

  it('refuses to connect a node that already has a parent, or to disconnect a branch', () => {
    const { mindmap, a, a1, floating } = build();
    expect(() => mindmap.connect(floating, a1)).toThrow('already connected');
    expect(a1.getParent()).toBe(a);
    expect(() => mindmap.disconnect(floating)).toThrow();
  });

  it('knows the nodes it holds, at any depth', () => {
    const { mindmap, a11, floating } = build();
    expect(mindmap.hasAlreadyAdded(a11)).toBe(true);
    expect(mindmap.hasAlreadyAdded(floating)).toBe(true);
    expect(mindmap.hasAlreadyAdded(mindmap.createNode('MainTopic', 99))).toBe(false);
    expect(mindmap.findNodeById(3)).toBe(a11);
    expect(mindmap.findNodeById(99)).toBeUndefined();
    expect([...mindmap.getNodeIds()].sort()).toEqual([0, 1, 2, 3, 4]);
  });

  it('measures the depth from the central topic', () => {
    expect(build().mindmap.getMaxDepth()).toBe(3);
    expect(Mindmap.buildEmpty('m').getMaxDepth()).toBe(0);
    expect(new Mindmap('m').getMaxDepth()).toBe(0);
  });

  it('deletes a child from its parent, and a floating topic from the branches', () => {
    const { mindmap, central, a1, a, floating } = build();
    a1.deleteNode();
    expect(a.getChildren()).toEqual([]);
    expect(mindmap.findNodeById(3)).toBeUndefined();

    floating.deleteNode();
    expect(mindmap.getBranches()).toEqual([central]);
  });

  it('tells whether a node is in a subtree', () => {
    const { a, a11, floating } = build();
    expect(a.isChildNode(a)).toBe(true);
    expect(a.isChildNode(a11)).toBe(true);
    expect(a.isChildNode(floating)).toBe(false);
    expect(a11.isChildNode(a)).toBe(false);
  });
});

describe('Mindmap copy and inspection', () => {
  it('copies the version, the description and every branch, deeply', () => {
    const { mindmap } = build();
    mindmap.setDescription('desc');
    mindmap.setVersion('tango');
    const target = new Mindmap('copy');

    mindmap.copyTo(target);
    expect(target.getVersion()).toBe('tango');
    expect(target.getDescription()).toBe('desc');
    expect(target.getBranches().map((b) => b.getId())).toEqual([0, 4]);

    const copiedA11 = target.findNodeById(3)!;
    expect(copiedA11).toBeDefined();
    expect(copiedA11).not.toBe(mindmap.findNodeById(3));
    expect(copiedA11.getParent()!.getId()).toBe(2);
    expect(target.findNodeById(1)!.getText()).toBe('a');
    expect(target.findNodeById(1)!.getMindmap()).toBe(target);
  });

  it('describes the branches and the children properties', () => {
    const { mindmap, a } = build();
    a.setPosition(5, 6);
    const text = mindmap.inspect();
    expect(text).toContain('version:');
    expect(text).toContain('(0) =>{ type: CentralTopic , id: 0');
    expect(text).toContain('(1) =>{ type: MainTopic , id: 4');
    // The central topic lists the properties of its child a.
    expect(text).toContain('children: {(size:1');
    expect(text).toContain('text:a,');
    // Object values are written as JSON.
    expect(text).toContain('position:{"x":5,"y":6},');
  });
});

describe('Mindmap canvas style', () => {
  it('keeps a style with a background pattern as it is', () => {
    const mindmap = new Mindmap('m');
    const style = {
      backgroundColor: '#fff',
      backgroundPattern: 'grid' as const,
      backgroundGridSize: 10,
      backgroundGridColor: '#eee',
    };
    mindmap.setCanvasStyle(style);
    expect(mindmap.getCanvasStyle()).toEqual(style);
  });

  it('drops the background attributes of a style without a pattern', () => {
    const mindmap = new Mindmap('m');
    mindmap.setCanvasStyle({ backgroundColor: '#fff', backgroundGridSize: 10 });
    expect(mindmap.getCanvasStyle()).toEqual({
      backgroundColor: undefined,
      backgroundGridSize: undefined,
      backgroundGridColor: undefined,
    });
    mindmap.setCanvasStyle(undefined);
    expect(mindmap.getCanvasStyle()).toBeUndefined();
  });
});

describe('NodeModel text and metadata', () => {
  it('reads the plain text of a plain, an HTML and an empty topic', () => {
    const node = Mindmap.buildEmpty('m').createNode('MainTopic', 1);
    expect(node.getPlainText()).toBe('');

    node.setText('a <b>c</b>');
    expect(node.getPlainText()).toBe('a <b>c</b>');

    node.setContentType(ContentType.HTML);
    expect(node.getPlainText()).toBe('a c');
  });

  it('stores metadata', () => {
    const node = Mindmap.buildEmpty('m').createNode('MainTopic', 1);
    node.setMetadata('{"k":1}');
    expect(node.getMetadata()).toBe('{"k":1}');
  });
});
