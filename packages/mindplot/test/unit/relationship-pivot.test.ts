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

import { $msg } from '../../src/components/Messages';
import ToolbarNotifier from '../../src/components/model/ToolbarNotifier';
import { buildDesigner, Harness } from './commands/designer-harness';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * Adding a relationship from the toolbar: a dashed pivot line follows the
 * pointer from the selected topic, and the next topic that takes the focus
 * becomes the target. A click on the canvas cancels it.
 */

const canvasOf = (harness: Harness) => {
  const canvas = harness.designer.getWorkSpace();
  return { canvas, svg: canvas.getSVGElement() };
};

const pivotLines = (harness: Harness): Element[] =>
  Array.from(canvasOf(harness).svg.querySelectorAll('path')).filter(
    (path) => (path.getAttribute('stroke-dasharray') ?? '').length > 0,
  );

const relationshipEnds = (harness: Harness) =>
  harness.designer
    .getModel()
    .getRelationships()
    .map((r) => [r.getModel().getFromNode(), r.getModel().getToNode()]);

const start = async (sourceId = 1) => {
  const harness = await buildDesigner();
  harness.designer.deselectAll();
  harness.topic(sourceId).setOnFocus(true);
  const existing = pivotLines(harness);
  const before = existing.length;
  harness.designer.showRelPivot(new MouseEvent('click', { clientX: 300, clientY: 300 }));
  // The relationships are dashed too: the pivot is the new dashed line.
  const pivot = pivotLines(harness).find((line) => !existing.includes(line));
  return { harness, before, pivot: pivot! };
};

let notify: jest.SpyInstance;
beforeEach(() => {
  notify = jest.spyOn(ToolbarNotifier, 'show').mockImplementation(() => undefined);
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('RelationshipPivot', () => {
  it('says so when no topic is selected', async () => {
    const harness = await buildDesigner();
    harness.designer.deselectAll();
    harness.designer.showRelPivot(new MouseEvent('click'));
    expect(notify).toHaveBeenCalledWith($msg('RELATIONSHIP_COULD_NOT_BE_CREATED'), true);
    expect(canvasOf(harness).canvas.isWorkspaceEventsEnabled()).toBe(true);
  });

  it('draws a dashed pivot and pauses the canvas events while it is active', async () => {
    const { harness, before } = await start();
    expect(pivotLines(harness).length).toBe(before + 1);
    expect(canvasOf(harness).canvas.isWorkspaceEventsEnabled()).toBe(false);
  });

  it('connects the source to the next topic that takes the focus, undoably', async () => {
    const { harness, pivot } = await start(1);
    const saved = harness.save();

    harness.topic(4).setOnFocus(true);
    expect(relationshipEnds(harness)).toContainEqual([1, 4]);
    expect(harness.designer.getModel().getRelationships()).toHaveLength(2);
    // The pivot is gone and the canvas listens again.
    expect(pivot.isConnected).toBe(false);
    expect(canvasOf(harness).canvas.isWorkspaceEventsEnabled()).toBe(true);

    harness.designer.undo();
    expect(harness.save()).toEqual(saved);
  });

  it('does not connect a topic to itself', async () => {
    const { harness, before, pivot } = await start(1);
    harness.topic(1).setOnFocus(false);
    harness.topic(1).setOnFocus(true);
    expect(harness.designer.getModel().getRelationships()).toHaveLength(1);
    expect(pivotLines(harness).length).toBe(before);
    expect(pivot.isConnected).toBe(false);
  });

  it('is cancelled by a click on the canvas', async () => {
    const { harness, before } = await start(1);
    canvasOf(harness).svg.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(pivotLines(harness).length).toBe(before);

    // A later focus change does not create a relationship.
    harness.topic(4).setOnFocus(true);
    expect(harness.designer.getModel().getRelationships()).toHaveLength(1);
  });

  it('follows the pointer, at most once a frame', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1000);
    const { harness, pivot: line } = await start(1);
    const { svg } = canvasOf(harness);
    const initial = line.getAttribute('d');

    svg.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10, bubbles: true }));
    const moved = line.getAttribute('d');
    expect(moved).not.toEqual(initial);

    // Within 16 ms of the last update, a move is ignored.
    now.mockReturnValue(1010);
    svg.dispatchEvent(new MouseEvent('mousemove', { clientX: 90, clientY: 90, bubbles: true }));
    expect(line.getAttribute('d')).toEqual(moved);

    now.mockReturnValue(1100);
    svg.dispatchEvent(new MouseEvent('mousemove', { clientX: 90, clientY: 90, bubbles: true }));
    expect(line.getAttribute('d')).not.toEqual(moved);
  });

  it('replaces an active pivot when started again', async () => {
    const { harness, before } = await start(1);
    harness.designer.showRelPivot(new MouseEvent('click', { clientX: 50, clientY: 50 }));
    expect(pivotLines(harness).length).toBe(before + 1);
  });
});
