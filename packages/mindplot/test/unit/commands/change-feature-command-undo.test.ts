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

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import SvgIconModel from '../../../src/components/model/SvgIconModel';
import NoteModel from '../../../src/components/model/NoteModel';
import { buildDesigner } from './designer-harness';

// A carries an emoji icon, a legacy plain note (no contentType) and a link.
const MAP = [
  '<map name="features" version="tango">',
  '  <topic id="0" central="true" text="Central">',
  '    <topic id="1" text="A" position="200,-50" order="0">',
  '      <eicon id="😀"/>',
  '      <note><![CDATA[plain note]]></note>',
  '      <link url="http://example.com" urlType="url"/>',
  '    </topic>',
  '  </topic>',
  '</map>',
].join('\n');

const featureId = (
  topic: ReturnType<Awaited<ReturnType<typeof buildDesigner>>['topic']>,
  type: string,
) => topic.getModel().findFeatureByType(type)[0].getId();

describe('ChangeFeatureToTopicCommand undo/redo', () => {
  it('restores an icon type', async () => {
    const { designer, save, topic } = await buildDesigner(MAP);
    const before = save();

    designer.getActionDispatcher().changeFeatureToTopic(1, featureId(topic(1), 'eicon'), {
      id: '😎',
    });
    const after = save();
    expect(after).toContain('id="😎"');

    designer.undo();
    expect(save()).toEqual(before);

    designer.redo();
    expect(save()).toEqual(after);
  });

  it('turns a plain note back into a plain note', async () => {
    const { designer, save, topic } = await buildDesigner(MAP);
    const before = save();
    const note = topic(1).getModel().findFeatureByType('note')[0] as NoteModel;
    expect(note.getAttributes()).not.toHaveProperty('contentType');

    // As the rich text editor does: it always saves HTML.
    topic(1).setNoteValue('<p>rich note</p>');
    const after = save();
    expect(note.getContentType()).toBe('html');

    designer.undo();
    expect(note.getText()).toBe('plain note');
    expect(note.getAttributes()).not.toHaveProperty('contentType');
    expect(save()).toEqual(before);

    designer.redo();
    expect(note.getContentType()).toBe('html');
    expect(save()).toEqual(after);
  });

  it('restores a link', async () => {
    const { designer, save, topic } = await buildDesigner(MAP);
    const before = save();

    topic(1).setLinkValue('mailto:someone@example.com');
    const after = save();
    expect(after).toContain('urlType="mail"');

    designer.undo();
    expect(save()).toEqual(before);

    designer.redo();
    expect(save()).toEqual(after);
  });
});

describe('FeatureModel.setAttributes', () => {
  it('treats an icon id as the icon type, not as the feature id', () => {
    const icon = new SvgIconModel({ id: 'flag_blue' });
    const id = icon.getId();

    icon.setAttributes({ id: 'flag_green' });

    expect(icon.getIconType()).toBe('flag_green');
    expect(icon.getId()).toBe(id);
  });

  it('removes attributes set to undefined', () => {
    const note = new NoteModel({ text: 'note', contentType: 'html' });

    note.setAttributes({ contentType: undefined });

    expect(note.getAttributes()).toEqual({ text: 'note' });
    expect(note.getAttributes()).not.toHaveProperty('contentType');
  });

  it('keeps an attribute it has no setter for', () => {
    const note = new NoteModel({ text: 'note' });

    note.setAttributes({ unknown: 'value' });

    expect(note.getAttribute('unknown')).toBe('value');
  });
});
