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
import type { Harness } from '../commands/designer-harness';
import { buildDesigner } from '../commands/designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/** A map in a web component: its canvas is in the shadow DOM of a host element. */
const buildInShadowRoot = async (): Promise<{ harness: Harness; wrapper: HTMLElement }> => {
  const wrapper = document.body.appendChild(document.createElement('div'));
  const host = wrapper.appendChild(document.createElement('div'));
  const container = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('div'));
  return { harness: await buildDesigner(undefined, container), wrapper };
};

const editorIn = (wrapper: HTMLElement): HTMLElement | null =>
  wrapper.querySelector(':scope > #textContainer');

// BL5-183: there was one text editor per page, placed next to the element with id mindmap-comp.
describe('MultilineTextEditor with two designers on the page', () => {
  let first: { harness: Harness; wrapper: HTMLElement };
  let second: { harness: Harness; wrapper: HTMLElement };

  beforeEach(async () => {
    first = await buildInShadowRoot();
    second = await buildInShadowRoot();
  });

  afterEach(() => {
    [first, second].forEach(({ harness }) => harness.designer.dispose());
    document.body.innerHTML = '';
  });

  it('places the editor next to the web component of the topic it edits', () => {
    first.harness.topic(1).showTextEditor('');

    expect(editorIn(first.wrapper)).not.toBeNull();
    expect(editorIn(second.wrapper)).toBeNull();

    second.harness.topic(2).showTextEditor('');
    expect(editorIn(second.wrapper)).not.toBeNull();
  });

  it('keeps the editor of one map open while the other map edits a topic', () => {
    const firstTopic = first.harness.topic(1);
    const secondTopic = second.harness.topic(2);

    firstTopic.showTextEditor('');
    secondTopic.showTextEditor('');

    expect(first.harness.designer.getTextEditor().getActiveTopic()).toBe(firstTopic);
    expect(second.harness.designer.getTextEditor().getActiveTopic()).toBe(secondTopic);
    expect(editorIn(first.wrapper)!.isConnected).toBe(true);
  });

  it('closes only its own editor when a designer is disposed', () => {
    const firstTopic = first.harness.topic(1);
    firstTopic.showTextEditor('');
    second.harness.topic(2).showTextEditor('');

    second.harness.designer.dispose();

    expect(first.harness.designer.getTextEditor().getActiveTopic()).toBe(firstTopic);
    expect(editorIn(second.wrapper)).toBeNull();
  });
});
