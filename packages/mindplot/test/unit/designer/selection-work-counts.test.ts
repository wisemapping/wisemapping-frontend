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
import HTMLTopicSelected from '../../../src/components/HTMLTopicSelected';
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
