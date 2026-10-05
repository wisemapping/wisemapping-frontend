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
    jest.restoreAllMocks();
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
