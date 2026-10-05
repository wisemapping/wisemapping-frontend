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
import { describe, expect, it } from '@jest/globals';
import Mindmap from '../../../src/components/model/Mindmap';
import NoteModel from '../../../src/components/model/NoteModel';
import ContentType from '../../../src/components/ContentType';
import TextExporterFactory from '../../../src/components/export/TextExporterFactory';

const HTML_NOTE = '<p>Rich <strong>note</strong></p>';
const PLAIN_NOTE = 'Plain note with a <tag> & an &amp; entity';

const buildMindmap = (): Mindmap => {
  const mindmap = new Mindmap('note-content-type');
  const central = mindmap.createNode('CentralTopic', 0);
  central.setText('Central');
  mindmap.addBranch(central);

  const htmlNoted = mindmap.createNode('MainTopic', 1);
  htmlNoted.setText('Html');
  htmlNoted.addFeature(new NoteModel({ text: HTML_NOTE, contentType: ContentType.HTML }));
  central.append(htmlNoted);

  const plainNoted = mindmap.createNode('MainTopic', 2);
  plainNoted.setText('Plain');
  plainNoted.addFeature(new NoteModel({ text: PLAIN_NOTE }));
  central.append(plainNoted);

  return mindmap;
};

describe('Note export honours the note content type', () => {
  it('txt exports html notes as text and plain notes verbatim', async () => {
    const result = await TextExporterFactory.create('txt', buildMindmap()).export();

    expect(result).toContain('[Note: Rich note]');
    expect(result).toContain(`[Note: ${PLAIN_NOTE}]`);
    expect(result).not.toContain('<strong>');
  });

  it('md exports html notes as text and plain notes escaped, so they render literally', async () => {
    const result = await TextExporterFactory.create('md', buildMindmap()).export();

    expect(result).toContain('Rich note');
    expect(result).toContain('Plain note with a \\<tag\\> & an \\&amp; entity');
    expect(result).not.toContain('<strong>');
  });

  it('txt is exported as text/plain', () => {
    expect(TextExporterFactory.create('txt', buildMindmap()).getContentType()).toBe('text/plain');
  });
});
