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
import type Topic from '../../../src/components/Topic';
import { buildDesigner, Harness } from '../commands/designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const rect = (left: number, top: number, width: number, height: number): DOMRect =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

// jsdom runs animation frames on a ~16 ms timer.
const afterAnimationFrames = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 100);
  });

/** The topic's screen rectangle, which the test moves as the canvas would. */
const mockTopicRect = (topic: Topic, initial: DOMRect) => {
  let current = initial;
  const group = topic.get2DElement().getNode();
  jest.spyOn(group, 'getBoundingClientRect').mockImplementation(() => current);
  return (next: DOMRect) => {
    current = next;
  };
};

const overlayOf = (harness: Harness, topic: Topic): HTMLElement => {
  const shadow = harness.designer.getSelectionShadows().get(topic);
  expect(shadow).toBeDefined();
  return (shadow as unknown as { _overlay: HTMLElement })._overlay;
};

// The overlay is drawn 2.5 px around the topic, 2 px left and 3 px up (computeOverlayGeometry).
const expectOverlayAround = (overlay: HTMLElement, topicRect: DOMRect) => {
  expect(overlay.style.display).toBe('block');
  expect(overlay.style.left).toBe(`${Math.round(topicRect.left - 4.5)}px`);
  expect(overlay.style.top).toBe(`${Math.round(topicRect.top - 5.5)}px`);
  expect(overlay.style.width).toBe(`${Math.round(topicRect.width + 5)}px`);
  expect(overlay.style.height).toBe(`${Math.round(topicRect.height + 5)}px`);
};

describe('HTMLTopicSelected follows the canvas', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const selectTopic = async () => {
    const harness = await buildDesigner();
    const topic = harness.topic(1);
    const moveTopic = mockTopicRect(topic, rect(200, 268.5, 150, 45));
    // As a click does: the other topics lose the focus, and this one gets it ...
    harness.designer.onObjectFocusEvent(topic);
    topic.setOnFocus(true);
    await afterAnimationFrames();

    const overlay = overlayOf(harness, topic);
    expectOverlayAround(overlay, rect(200, 268.5, 150, 45));
    return { harness, topic, overlay, moveTopic };
  };

  // A screenshot of the window taken right after a resize (Cypress shrinks the viewport while it
  // captures) showed the overlay where the topic was before: it moved two animation frames later.
  it('moves the overlay with its topic in the same frame when the window is resized', async () => {
    const { overlay, moveTopic } = await selectTopic();

    // The window gets shorter: the canvas keeps its centre, so the topic moves up ...
    const moved = rect(200, 255, 150, 45);
    moveTopic(moved);
    window.dispatchEvent(new Event('resize'));

    // ... and the overlay with it, before any animation frame has run.
    expectOverlayAround(overlay, moved);
  });

  it('moves the overlay with its topic in the same frame when the canvas is zoomed', async () => {
    const { harness, overlay, moveTopic } = await selectTopic();

    const zoomed = rect(180, 250, 180, 54);
    moveTopic(zoomed);
    harness.designer.getWorkSpace().setZoom(0.8);

    expectOverlayAround(overlay, zoomed);
  });
});
