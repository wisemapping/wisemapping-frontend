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
 * The theme picks the text colour that reads on what is behind the text, the canvas for a
 * topic drawn without a fill (BL5-58). A canvas colour change must redraw those topics, on
 * execute, undo and redo (BL5-122).
 */
import { buildDesigner, Harness } from './designer-harness';
import Topic from '../../../src/components/Topic';
import LayoutManager from '../../../src/components/layout/LayoutManager';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const BLACK = '#000000';
const WHITE = '#FFFFFF';
// A model canvas style without a pattern drops its colours (Mindmap.setCanvasStyle).
const DARK_CANVAS = { backgroundColor: '#1a1a1a', backgroundPattern: 'solid' as const };

const textColor = (topic: Topic): string | null =>
  topic.getOrBuildTextShape().getColor()?.toUpperCase() ?? null;

describe('ChangeCanvasStyleCommand', () => {
  let harness: Harness;

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    harness = await buildDesigner();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('redraws the text colour of the topics drawn on the canvas, on execute, undo and redo', () => {
    // A (1) is a main topic, drawn as a line (classic theme): its text is on the canvas.
    const main = harness.topic(1);
    expect(textColor(main)).toBe(BLACK);

    harness.designer.setCanvasStyle(DARK_CANVAS);
    expect(textColor(main)).toBe(WHITE);

    harness.designer.undo();
    expect(textColor(main)).toBe(BLACK);

    harness.designer.redo();
    expect(textColor(main)).toBe(WHITE);
  });

  it('redraws every topic once, floating ones included, and lays nothing out', () => {
    const topics = harness.designer.getModel().getTopics();
    const redraws = jest.spyOn(Topic.prototype, 'redraw');
    const layouts = jest.spyOn(LayoutManager.prototype, 'layout');

    harness.designer.setCanvasStyle(DARK_CANVAS);

    expect(redraws).toHaveBeenCalledTimes(topics.length);
    expect(new Set(redraws.mock.contexts)).toEqual(new Set(topics));
    // A text colour changes no size.
    expect(layouts).not.toHaveBeenCalled();
  });
});
