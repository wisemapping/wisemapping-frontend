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
 * Topics, their icons, the text editor, a dragged topic and the relationship control points ran
 * their commands through ActionDispatcher.getInstance(): the dispatcher of the last designer
 * built. With two designers on the page, an edit in the first changed the second's map (BL5-144).
 */
import { buildDesigner, Harness } from '../commands/designer-harness';
import NoteModel from '../../../src/components/model/NoteModel';
import LinkModel from '../../../src/components/model/LinkModel';
import NoteIcon from '../../../src/components/NoteIcon';
import LinkIcon from '../../../src/components/LinkIcon';
import ShrinkConnector from '../../../src/components/ShrinkConnector';
import WidgetBuilder from '../../../src/components/WidgetBuilder';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const noteOf = (harness: Harness, id: number): string | null => harness.topic(id).getNoteValue();
const linkOf = (harness: Harness, id: number): string | undefined =>
  harness.topic(id).getLinkValue();

describe('Commands of a topic with two designers on the page (BL5-144)', () => {
  let first: Harness;
  let second: Harness;

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    first = await buildDesigner();
    // The second designer is the last built: it owns ActionDispatcher.getInstance() ...
    second = await buildDesigner();
    [first, second].forEach((harness) =>
      jest.spyOn(harness.designer, 'getWidgetManager').mockReturnValue({
        createTooltipForLink: jest.fn(),
        configureTooltipForNode: jest.fn(),
      } as unknown as WidgetBuilder),
    );
  });

  afterEach(() => {
    first.designer.dispose();
    second.designer.dispose();
    jest.restoreAllMocks();
  });

  it('sets and clears the note and the link of its own map', () => {
    first.topic(1).setNoteValue('<p>note</p>');
    first.topic(1).setLinkValue('https://example.com');

    expect(noteOf(first, 1)).toBe('<p>note</p>');
    expect(linkOf(first, 1)).toBe('https://example.com');
    expect(noteOf(second, 1)).toBeNull();
    expect(linkOf(second, 1)).toBeUndefined();

    // The undo is on the first designer's stack ...
    first.designer.undo();
    expect(linkOf(first, 1)).toBeUndefined();
  });

  it('removes a note or link icon from its own topic', () => {
    [first, second].forEach((harness) => {
      harness.topic(1).setNoteValue('<p>note</p>');
      harness.topic(1).setLinkValue('https://example.com');
    });
    const topic = first.topic(1);
    const note = topic.getModel().findFeatureByType('note')[0] as NoteModel;
    const link = topic.getModel().findFeatureByType('link')[0] as LinkModel;

    new NoteIcon(topic, note, false).remove();
    new LinkIcon(topic, link, false).remove();

    expect(noteOf(first, 1)).toBeNull();
    expect(linkOf(first, 1)).toBeUndefined();
    expect(noteOf(second, 1)).toBe('<p>note</p>');
    expect(linkOf(second, 1)).toBe('https://example.com');
  });

  it('collapses its own branch from the shrink connector', () => {
    const topic = first.topic(1);
    const connector = new ShrinkConnector(topic);
    const ellipse = (connector as unknown as { _ellipse: { getNode(): Element } })._ellipse;

    ellipse.getNode().dispatchEvent(new MouseEvent('click'));

    expect(topic.getModel().areChildrenShrunken()).toBe(true);
    expect(second.topic(1).getModel().areChildrenShrunken()).toBe(false);
  });
});
