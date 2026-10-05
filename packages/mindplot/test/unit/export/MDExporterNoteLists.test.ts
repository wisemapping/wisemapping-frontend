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

// Exports a map whose topics have the notes, and returns its footnotes section.
const footnotes = async (...notes: { text: string; contentType?: ContentType }[]) => {
  const mindmap = new Mindmap('md-note-lists');
  const central = mindmap.createNode('CentralTopic', 0);
  central.setText('Central');
  mindmap.addBranch(central);
  notes.forEach((note, index) => {
    const topic = mindmap.createNode('MainTopic', index + 1);
    topic.setText(`Topic ${index + 1}`);
    topic.addFeature(new NoteModel(note));
    central.append(topic);
  });
  const md = await TextExporterFactory.create('md', mindmap).export();
  return md.slice(md.indexOf('[^1]:'));
};

const html = (text: string) => ({ text, contentType: ContentType.HTML });

describe('MD export of notes with lists', () => {
  it('writes nested lists indented in the footnote', async () => {
    const result = await footnotes(
      html(
        '<ul><li>one<ul><li>one.a<ol><li>first</li><li>second</li></ol></li></ul></li>' +
          '<li>two</li></ul>',
      ),
    );

    expect(result).toBe(
      [
        '[^1]: - one',
        '        - one.a',
        '            1. first',
        '            2. second',
        '    - two',
        '',
      ].join('\n'),
    );
  });

  it('keeps the text around the lists as paragraphs of the footnote', async () => {
    const result = await footnotes(
      html('<div>Plan</div><ol><li>a</li><li>b<br>c</li></ol><div>Done <b>now</b></div>'),
    );

    expect(result).toBe(
      ['[^1]: Plan', '', '    1. a', '    2. b c', '', '    Done now', ''].join('\n'),
    );
  });

  it('escapes the Markdown in the items', async () => {
    const result = await footnotes(html('<ul><li>- *not* [a](b) #1</li><li>2. x</li></ul>'));

    expect(result).toBe(['[^1]: - \\- \\*not\\* \\[a\\](b) \\#1', '    - 2\\. x', ''].join('\n'));
  });

  it('nests a sub-list written next to the items', async () => {
    const result = await footnotes(html('<ul><li>a</li><ul><li>b</li></ul><li>c</li></ul>'));

    expect(result).toBe(['[^1]: - a', '        - b', '    - c', ''].join('\n'));
  });

  it('leaves a blank line before the footnote after a list', async () => {
    const result = await footnotes(html('<ul><li>a</li></ul>'), html('<p>plain</p>'));

    expect(result).toBe(['[^1]: - a', '', '[^2]: plain', ''].join('\n'));
  });

  it('keeps a note without lists on one line', async () => {
    const result = await footnotes(html('<p>one <b>two</b></p>'), { text: '- a\n- b' });

    expect(result).toBe(['[^1]: one two', '[^2]: \\- a - b', ''].join('\n'));
  });
});
