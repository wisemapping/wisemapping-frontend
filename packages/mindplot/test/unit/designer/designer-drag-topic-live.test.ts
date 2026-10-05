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

import { buildDesigner, Harness, SAMPLE_MAP } from '../commands/designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * Dragging a topic with the mouse on a live designer: the drop reconnects it
 * where the drag pivot showed, or leaves it floating, as one undoable step.
 *
 * Positions are given in map coordinates and turned into client coordinates
 * with the current viewport, which pans when the dragged topic takes the focus.
 */

const mouse = (type: string, [clientX, clientY]: [number, number]) =>
  new MouseEvent(type, { clientX, clientY, bubbles: true, cancelable: true });

const toClient = (harness: Harness, x: number, y: number): [number, number] => {
  const screen = harness.designer.getWorkSpace().getScreenManager();
  const origin = screen.getWorkspaceMousePosition(mouse('mousemove', [0, 0]));
  const unit = screen.getWorkspaceMousePosition(mouse('mousemove', [100, 0]));
  const scale = (unit.x - origin.x) / 100;
  return [(x - origin.x) / scale, (y - origin.y) / scale];
};

const nativeOf = (harness: Harness, id: number): SVGElement =>
  (harness.topic(id).get2DElement() as unknown as { peer: { _native: SVGElement } }).peer._native;

/** Presses on the topic, moves through `path` (map coordinates) and leaves the button down. */
const dragThrough = (harness: Harness, id: number, path: [number, number][]) => {
  const start = harness.topic(id).getPosition();
  nativeOf(harness, id).dispatchEvent(mouse('mousedown', toClient(harness, start.x, start.y)));
  const container = harness.designer.getContainer();
  path.forEach(([x, y]) => container.dispatchEvent(mouse('mousemove', toClient(harness, x, y))));
  return container;
};

const drag = (harness: Harness, id: number, path: [number, number][]) => {
  const container = dragThrough(harness, id, path);
  const [x, y] = path[path.length - 1];
  container.dispatchEvent(mouse('mouseup', toClient(harness, x, y)));
};

const parentOf = (harness: Harness, id: number) =>
  harness.topic(id).getModel().getParent()?.getId();

const harnesses: Harness[] = [];
const open = async (xml = SAMPLE_MAP): Promise<Harness> => {
  const harness = await buildDesigner(xml);
  harnesses.push(harness);
  return harness;
};

afterEach(() => {
  harnesses.splice(0).forEach((harness) => harness.designer.dispose());
  jest.restoreAllMocks();
});

describe('Dragging a topic on a mind map', () => {
  it('moves B1 under A, after A1, as one undoable step', async () => {
    const harness = await open();
    const before = harness.save();
    drag(harness, 4, [
      [-206, 20],
      [150, 30],
      [160, 40],
    ]);
    expect(parentOf(harness, 4)).toBe(1);
    expect(harness.topic(4).getModel().getOrder()).toBe(1);
    const after = harness.save();

    harness.designer.undo();
    expect(harness.save()).toEqual(before);
    expect(parentOf(harness, 4)).toBe(3);
    harness.designer.redo();
    expect(harness.save()).toEqual(after);
  });

  it('leaves the topic floating where it was dropped, away from every topic', async () => {
    const harness = await open();
    const before = harness.save();
    drag(harness, 4, [
      [-206, 20],
      [260, 20],
    ]);
    expect(parentOf(harness, 4)).toBeUndefined();
    expect(harness.topic(4).getPosition()).toEqual({ x: 260, y: 20 });

    harness.designer.undo();
    expect(harness.save()).toEqual(before);
  });

  it('leaves everything in place when Escape cancels the drag', async () => {
    const harness = await open();
    const before = harness.save();
    dragThrough(harness, 4, [
      [-206, 20],
      [160, 40],
    ]);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(harness.save()).toEqual(before);
    expect(harness.designer.getWorkSpace().isWorkspaceEventsEnabled()).toBe(true);
  });
});

describe('Dragging a topic on a tree', () => {
  const TREE = SAMPLE_MAP.replace('version="tango"', 'version="tango" layout="tree"');

  it('moves B1 under A, as one undoable step', async () => {
    const harness = await open(TREE);
    const before = harness.save();
    const start = harness.topic(4).getPosition();
    drag(harness, 4, [
      [start.x + 20, start.y + 20],
      [0, 150],
    ]);
    expect(parentOf(harness, 4)).toBe(1);

    harness.designer.undo();
    expect(harness.save()).toEqual(before);
  });

  it('keeps B1 under B when dropped next to it', async () => {
    const harness = await open(TREE);
    const start = harness.topic(4).getPosition();
    drag(harness, 4, [
      [start.x + 20, start.y + 20],
      [100, 100],
    ]);
    expect(parentOf(harness, 4)).toBe(3);
    expect(harness.topic(4).getModel().getOrder()).toBe(0);
  });
});
