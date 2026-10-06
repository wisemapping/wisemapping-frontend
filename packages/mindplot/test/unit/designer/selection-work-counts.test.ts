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

import { buildDesigner } from '../commands/designer-harness';
import { buildMediumMap, useTextSizedBoxes } from './medium-map';
import Canvas from '../../../src/components/Canvas';
import type Designer from '../../../src/components/Designer';
import HTMLTopicSelected from '../../../src/components/HTMLTopicSelected';
import NodeGraph from '../../../src/components/NodeGraph';
import Relationship from '../../../src/components/Relationship';
import Topic from '../../../src/components/Topic';
import TopicEventDispatcher from '../../../src/components/TopicEventDispatcher';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/*
 * Selecting, deselecting and panning must not do work that grows with the size of the map for
 * each topic. These tests count the work a 500-topic map costs, never the time it takes. Every
 * bound fails on the code from before selection was optimised; the counts it had are noted next
 * to each one.
 */

const TOPICS = 500;

/** Restores the methods countCalls replaced. */
const restores: (() => void)[] = [];

/**
 * Counts the calls of a method without recording them: a jest spy keeps the arguments and the
 * receiver of each call, which runs out of memory on the hundreds of thousands the old code made.
 */
const countCalls = <T extends object>(target: T, name: keyof T & string) => {
  const original = target[name] as unknown as (...args: unknown[]) => unknown;
  const counter = { count: 0 };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (target as any)[name] = function counted(this: unknown, ...args: unknown[]) {
    counter.count += 1;
    return original.apply(this, args);
  };
  restores.push(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (target as any)[name] = original;
  });
  return counter;
};

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

/**
 * Holds the animation frames requested, to run them one frame at a time. The frames the map load
 * requested run first, so that no update is pending.
 */
const useFrameQueue = async () => {
  await nextFrame();
  await nextFrame();
  let queue: FrameRequestCallback[] = [];
  const requests = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    queue.push(callback);
    return queue.length;
  });
  const runFrame = (): void => {
    const frame = queue;
    queue = [];
    frame.forEach((callback) => callback(0));
  };
  const runFrames = (): void => {
    while (queue.length > 0) {
      runFrame();
    }
  };
  return { requests, runFrame, runFrames };
};

const countEvents = (designer: Designer) => {
  const fired: Record<string, number> = {
    onfocus: 0,
    onblur: 0,
    topicSelected: 0,
    topicUnselected: 0,
  };
  designer.addEvent('onfocus', () => {
    fired.onfocus! += 1;
  });
  designer.addEvent('onblur', () => {
    fired.onblur! += 1;
  });
  const bus = designer.getLayoutEventBus();
  bus.addEvent('topicSelected', () => {
    fired.topicSelected! += 1;
  });
  bus.addEvent('topicUnselected', () => {
    fired.topicUnselected! += 1;
  });
  return fired;
};

describe('Selection work', () => {
  let restoreBoxes: () => void;

  beforeAll(() => {
    restoreBoxes = useTextSizedBoxes();
  });

  afterAll(() => {
    restoreBoxes();
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    restores.splice(0).forEach((restore) => restore());
    jest.restoreAllMocks();
  });

  it('selects every topic in one pass, with one designer event and at most one pan', async () => {
    const { designer } = await buildDesigner(buildMediumMap({ topics: TOPICS }));
    const topics = designer.getModel().getTopics();
    const relationships = designer.getModel().getRelationships();
    expect(topics).toHaveLength(TOPICS);
    const fired = countEvents(designer);
    const focusReads = countCalls(NodeGraph.prototype, 'isOnFocus');
    const pans = jest.spyOn(Canvas.prototype, 'ensureVisible');
    // The central topic is selected when the map loads.
    const alreadySelected = designer.getModel().filterSelectedTopics().length;
    focusReads.count = 0;

    designer.selectAll();
    const reads = focusReads.count;

    expect(topics.every((topic) => topic.isOnFocus())).toBe(true);
    expect(relationships.every((relationship) => relationship.isOnFocus())).toBe(true);
    // Each topic still reports its own selection, as before.
    expect(fired.topicSelected).toBe(TOPICS - alreadySelected);
    // Before: 511, one per topic and relationship selected.
    expect(fired.onfocus).toBe(1);
    // Before: 499, one per topic selected.
    expect(pans.mock.calls.length).toBeLessThanOrEqual(1);
    // Before: 63,005,749: each topic selected counted the selection, and each pan updated every
    // overlay, which counted it again. Now a few per topic.
    expect(reads).toBeLessThan(10 * TOPICS);
  });

  it('deselects every topic in one pass, with one designer event', async () => {
    const { designer } = await buildDesigner(buildMediumMap({ topics: TOPICS }));
    designer.selectAll();
    const fired = countEvents(designer);
    const focusReads = countCalls(NodeGraph.prototype, 'isOnFocus');

    designer.deselectAll();
    const reads = focusReads.count;

    expect(designer.getModel().filterSelectedTopics()).toHaveLength(0);
    expect(designer.getModel().filterSelectedRelationships()).toHaveLength(0);
    expect(fired.topicUnselected).toBe(TOPICS);
    // Fired once, when the selection became empty: as before.
    expect(fired.onblur).toBe(1);
    expect(fired.onfocus).toBe(0);
    // Before: 257,000. Now a few per topic.
    expect(reads).toBeLessThan(10 * TOPICS);
  });

  it('a click on the background after select-all deselects in one pass, with one designer event', async () => {
    const { designer } = await buildDesigner(buildMediumMap({ topics: TOPICS }));
    designer.selectAll();
    const fired = countEvents(designer);
    const focusReads = countCalls(NodeGraph.prototype, 'isOnFocus');

    designer.onObjectFocusEvent(undefined, new MouseEvent('click'));
    const reads = focusReads.count;

    expect(designer.getModel().filterSelectedTopics()).toHaveLength(0);
    expect(designer.getModel().filterSelectedRelationships()).toHaveLength(0);
    // Each topic still reports its own deselection, as before.
    expect(fired.topicUnselected).toBe(TOPICS);
    expect(fired.onblur).toBe(1);
    expect(fired.onfocus).toBe(0);
    // Before: 257,500: each topic unselected counted the selection. Now a few per topic.
    expect(reads).toBeLessThan(10 * TOPICS);
  });

  it('a click on a topic after select-all keeps only that topic, with one designer event', async () => {
    const { designer, topic } = await buildDesigner(buildMediumMap({ topics: TOPICS }));
    designer.selectAll();
    const fired = countEvents(designer);
    const focusReads = countCalls(NodeGraph.prototype, 'isOnFocus');

    designer.onObjectFocusEvent(topic(3), new MouseEvent('mousedown'));
    const reads = focusReads.count;

    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(3)]);
    expect(designer.getModel().filterSelectedRelationships()).toHaveLength(0);
    expect(fired.topicUnselected).toBe(TOPICS - 1);
    // The selection changed without becoming empty: one 'onfocus' (before: none, so the editor
    // kept showing every topic selected), no 'onblur'.
    expect(fired).toMatchObject({ onblur: 0, onfocus: 1, topicSelected: 0 });
    // Before: 256,998. Now a few per topic.
    expect(reads).toBeLessThan(10 * TOPICS);
  });

  it('a Ctrl or Cmd click keeps the selection', async () => {
    const { designer } = await buildDesigner(buildMediumMap({ topics: 50 }));
    designer.selectAll();
    const fired = countEvents(designer);

    designer.onObjectFocusEvent(undefined, new MouseEvent('click', { ctrlKey: true }));
    designer.onObjectFocusEvent(undefined, new MouseEvent('click', { metaKey: true }));

    expect(designer.getModel().countSelectedTopics()).toBe(50);
    expect(fired).toEqual({ onfocus: 0, onblur: 0, topicSelected: 0, topicUnselected: 0 });
  });

  it('selecting or unselecting one topic does not scan the topics', async () => {
    const { designer, topic } = await buildDesigner(buildMediumMap({ topics: TOPICS }));
    const fired = countEvents(designer);
    const focusReads = countCalls(NodeGraph.prototype, 'isOnFocus');

    topic(3).setOnFocus(true);
    topic(3).setOnFocus(false);

    expect(fired.onfocus).toBe(1);
    // Before: 1,005: the designer's handlers counted the selected topics by reading every topic.
    expect(focusReads.count).toBeLessThan(TOPICS / 5);
  });

  it('selecting or unselecting a topic or a relationship does not scan the relationships', async () => {
    const RELATIONSHIPS = 200;
    const { designer, topic } = await buildDesigner(
      buildMediumMap({ topics: 50, relationships: RELATIONSHIPS }),
    );
    const relationships = designer.getModel().getRelationships();
    expect(relationships).toHaveLength(RELATIONSHIPS);
    const relationship = relationships[0]!;
    const fired = countEvents(designer);
    const focusReads = countCalls(Relationship.prototype, 'isOnFocus');

    topic(3).setOnFocus(true);
    topic(3).setOnFocus(false);
    relationship.setOnFocus(true);
    relationship.setOnFocus(false);

    expect(fired.onfocus).toBe(2);
    expect(designer.getModel().countSelectedRelationships()).toBe(0);
    // Before: 1,002: the designer's handlers listed the selected relationships by reading each one.
    expect(focusReads.count).toBeLessThan(RELATIONSHIPS / 5);
  });

  it('selecting and deselecting every relationship reads each one a few times', async () => {
    const RELATIONSHIPS = 200;
    const { designer } = await buildDesigner(
      buildMediumMap({ topics: 50, relationships: RELATIONSHIPS }),
    );
    const focusReads = countCalls(Relationship.prototype, 'isOnFocus');

    designer.selectAll();
    expect(designer.getModel().countSelectedRelationships()).toBe(RELATIONSHIPS);
    designer.deselectAll();
    expect(designer.getModel().countSelectedRelationships()).toBe(0);

    // Two reads per relationship and pass. Before: 1,200: _setFocusOfAll also listed the selected
    // relationships after each pass.
    expect(focusReads.count).toBeLessThanOrEqual(4 * RELATIONSHIPS);
  });

  it('selecting all again fires nothing and does not pan', async () => {
    const { designer } = await buildDesigner(buildMediumMap({ topics: TOPICS }));
    designer.selectAll();
    const fired = countEvents(designer);
    const pans = jest.spyOn(Canvas.prototype, 'ensureVisible');

    designer.selectAll();

    // Nothing changed: as before.
    expect(fired).toEqual({ onfocus: 0, onblur: 0, topicSelected: 0, topicUnselected: 0 });
    expect(pans).not.toHaveBeenCalled();
  });

  it('selecting every topic updates each selection overlay at most twice', async () => {
    const { designer } = await buildDesigner(buildMediumMap({ topics: TOPICS }));
    const { requests, runFrames } = await useFrameQueue();
    const updates = countCalls(HTMLTopicSelected.prototype, 'update');

    designer.selectAll();
    // Before: 998 frame requests, two per topic selected.
    expect(requests.mock.calls.length).toBeLessThanOrEqual(2);
    runFrames();
    // One overlay per selected topic, updated when the canvas pans to the last topic selected,
    // and in the frame. Before: every overlay for each pan and each topic selected.
    expect(designer.getSelectionShadows().size).toBe(TOPICS);
    expect(updates.count).toBeLessThanOrEqual(2 * TOPICS);
  });

  it('a single selected topic still shows its overlay, and two hide it', async () => {
    const { designer, topic } = await buildDesigner(buildMediumMap({ topics: 50 }));
    const { runFrames } = await useFrameQueue();
    const shadowOf = (id: number) => designer.getSelectionShadows().get(topic(id))!;
    const visible = (id: number) => (shadowOf(id) as unknown as { _isVisible: boolean })._isVisible;

    designer.onObjectFocusEvent(topic(3));
    topic(3).setOnFocus(true);
    runFrames();
    expect(visible(3)).toBe(true);

    topic(4).setOnFocus(true);
    runFrames();
    expect(visible(3)).toBe(false);
    expect(visible(4)).toBe(false);

    topic(4).setOnFocus(false);
    runFrames();
    expect(visible(3)).toBe(true);
  });

  it('updates the selection overlays once per frame, whatever the number of events', async () => {
    const { designer, topic } = await buildDesigner(buildMediumMap({ topics: TOPICS }));
    const selected = [1, 2, 3, 4, 5];
    selected.forEach((id) => topic(id).setOnFocus(true));
    const { requests, runFrame, runFrames } = await useFrameQueue();
    const updates = countCalls(HTMLTopicSelected.prototype, 'update');
    const overlays = designer.getSelectionShadows().size;
    expect(overlays).toBeGreaterThanOrEqual(selected.length);

    // A burst of layout events, as a layout of a 500-topic map fires: one update of each
    // overlay, two frames later.
    const bus = designer.getLayoutEventBus();
    const moved = { node: topic(3).getModel(), position: { x: 0, y: 0 } };
    for (let i = 0; i < TOPICS; i++) {
      bus.fireEvent('topicMoved', moved);
    }
    // Before: 500 frame requests, then 500 more.
    expect(requests.mock.calls.length).toBe(1);
    runFrame();
    expect(updates.count).toBe(0);
    runFrame();
    // Before: 500 updates of each overlay.
    expect(updates.count).toBe(overlays);
    runFrames();
    expect(updates.count).toBe(overlays);
    expect(requests.mock.calls.length).toBe(2);

    // An event after the first frame of a pending update gets its own: it may come from a change
    // that frame made, so it is not folded into an update the frame after.
    requests.mockClear();
    updates.count = 0;
    bus.fireEvent('topicMoved', moved);
    runFrame();
    bus.fireEvent('topicMoved', moved);
    runFrames();
    expect(requests.mock.calls.length).toBe(4);
    expect(updates.count).toBe(2 * overlays);
  });

  it('closes the text editor once per pan or wheel event, not once per topic', async () => {
    const { designer } = await buildDesigner(buildMediumMap({ topics: TOPICS }));
    const topicCloses = jest.spyOn(Topic.prototype, 'closeEditors');
    const closes = jest.spyOn(TopicEventDispatcher.prototype, 'close');

    designer.panBy(10, 10);
    designer
      .getContainer()
      .dispatchEvent(new WheelEvent('wheel', { deltaX: 5, deltaY: 5, cancelable: true }));

    // Before: 1,000, one per topic per event.
    expect(topicCloses).not.toHaveBeenCalled();
    expect(closes.mock.calls.length).toBe(2);
  });

  it('a pan still closes an open text editor, saving it', async () => {
    const { designer, topic } = await buildDesigner(buildMediumMap({ topics: 50 }));
    const editor = designer.getTextEditor();
    topic(3).showTextEditor('Edited');
    expect(editor.isActive()).toBe(true);
    const close = jest.spyOn(editor, 'close');

    designer.panBy(10, 10);

    expect(close).toHaveBeenCalledWith(true);
    expect(editor.isActive()).toBe(false);
  });
});
