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

/*
 * Pins what a medium map renders, topic by topic, after loading it and after each
 * operation that redraws it. The redraw optimizations (one redraw per topic, skipped
 * setters, cached theme resolution, coalesced editor layout) must leave every
 * position, size, colour and SVG element exactly as it was.
 */
import { buildDesigner, Harness } from '../commands/designer-harness';
import ActionDispatcher from '../../../src/components/ActionDispatcher';
import { buildMediumMap, renderSnapshot, stubTextMeasurement } from './RenderFixture';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const nextFrame = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });

beforeAll(() => {
  stubTextMeasurement();
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('redraw render snapshot of a medium map', () => {
  let harness: Harness;

  beforeAll(async () => {
    harness = await buildDesigner(buildMediumMap());
  });

  it('renders the loaded map', () => {
    expect(harness.designer.getModel().getTopics().length).toBeGreaterThan(60);
    expect(renderSnapshot(harness.designer)).toMatchSnapshot();
  });

  it('renders the same after switching to the tree layout and back', () => {
    harness.designer.applyLayout('tree');
    expect(renderSnapshot(harness.designer)).toMatchSnapshot('tree');
    harness.designer.applyLayout('mindmap');
    expect(renderSnapshot(harness.designer)).toMatchSnapshot('mindmap');
  });

  it('renders the same after toggling the theme variant', () => {
    harness.designer.setThemeVariant('dark');
    expect(renderSnapshot(harness.designer)).toMatchSnapshot('dark');
    harness.designer.setThemeVariant('light');
    expect(renderSnapshot(harness.designer)).toMatchSnapshot('light');
    harness.designer.initializeThemeVariant('dark');
    expect(renderSnapshot(harness.designer)).toMatchSnapshot('initialized dark');
    harness.designer.initializeThemeVariant('light');
  });

  it('renders the same while typing in the text editor and after committing', async () => {
    const topic = harness.topic(2);
    harness.designer.getTextEditor().show(topic);
    const textarea = document.querySelector('#textContainer textarea') as HTMLTextAreaElement;
    // One keystroke per frame, as a person types. The editor lays the map out once per
    // frame, so several keystrokes in one frame are laid out together.
    const values = ['T', 'Ty', 'Typ', 'Typed text', 'Typed text\nwith a second line'];
    for (let i = 0; i < values.length; i++) {
      textarea.value = values[i];
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      // eslint-disable-next-line no-await-in-loop
      await nextFrame();
    }
    expect(renderSnapshot(harness.designer)).toMatchSnapshot('typing');

    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, code: 'Enter' }),
    );
    await nextFrame();
    expect(harness.designer.getTextEditor().isActive()).toBe(false);
    expect(topic.getModel().getText()).toBe('Typed text\nwith a second line');
    expect(renderSnapshot(harness.designer)).toMatchSnapshot('committed');
  });

  it('renders the same after style, feature and image changes', () => {
    const dispatcher = ActionDispatcher.getInstance();
    dispatcher.changeFontSizeToTopic([1], 16);
    dispatcher.changeBackgroundColorToTopic([7], '#ffcc00');
    dispatcher.changeBorderColorToTopic([1], '#0000ff');
    dispatcher.changeShapeTypeToTopic([8], 'line');
    dispatcher.changeTextToTopic([3], 'Changed by a command');
    dispatcher.addFeatureToTopic([10], 'icon', { id: 'conn_disconnect' });
    dispatcher.addFeatureToTopic([10], 'link', { url: 'https://example.com' });
    dispatcher.addFeatureToTopic([10], 'icon', { id: 'conn_connect' });
    dispatcher.changeImageEmojiCharToTopic([9], '🎉');
    dispatcher.changeImageEmojiCharToTopic([11], '🙂');
    dispatcher.changeImageGalleryIconNameToTopic([15], 'favorite');
    expect(renderSnapshot(harness.designer)).toMatchSnapshot('styled');
  });

  it('renders the same after changing the theme', () => {
    harness.designer.applyTheme('prism');
    expect(renderSnapshot(harness.designer)).toMatchSnapshot('prism');
    harness.designer.setThemeVariant('dark');
    expect(renderSnapshot(harness.designer)).toMatchSnapshot('prism dark');
  });
});
