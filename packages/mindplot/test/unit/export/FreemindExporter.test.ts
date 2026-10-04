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

/* eslint-disable import/no-extraneous-dependencies */
import { describe, expect, test } from '@jest/globals';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';
import NoteModel from '../../../src/components/model/NoteModel';
import ContentType from '../../../src/components/ContentType';
import FreemindExporter from '../../../src/components/export/FreemindExporter';

const buildMindmap = (configure: (topic: NodeModel) => void): Mindmap => {
  const mindmap = new Mindmap('test');
  const central = mindmap.createNode('CentralTopic', 1);
  central.setText('Central');
  const topic = mindmap.createNode('MainTopic', 2);
  topic.setPosition(200, 0);
  topic.setOrder(0);
  topic.setText('Topic');
  configure(topic);
  central.append(topic);
  mindmap.addBranch(central);
  return mindmap;
};

const exportMindmap = async (mindmap: Mindmap): Promise<Document> => {
  const mm = await new FreemindExporter(mindmap).export();
  const doc = new DOMParser().parseFromString(mm, 'text/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return doc;
};

const exportedTopic = (doc: Document): Element => doc.querySelector('node[ID="ID_2"]')!;

describe('FreemindExporter', () => {
  test('converts rgb() colors to hexadecimal', async () => {
    const doc = await exportMindmap(
      buildMindmap((topic) => {
        topic.setShapeType('rectangle');
        topic.setBackgroundColor('rgb(255, 0, 128)');
        topic.setBorderColor('rgb(16,32,48)');
      }),
    );

    const node = exportedTopic(doc);
    expect(node.getAttribute('BACKGROUND_COLOR')).toBe('#ff0080');
    expect(node.querySelector(':scope > edge')!.getAttribute('COLOR')).toBe('#102030');
  });

  test('does not export normal font weight as bold', async () => {
    const doc = await exportMindmap(buildMindmap((topic) => topic.setFontWeight('normal')));

    const font = exportedTopic(doc).querySelector(':scope > font');
    expect(font?.getAttribute('BOLD') ?? null).toBeNull();
  });

  test('exports bold font weight as bold', async () => {
    const doc = await exportMindmap(buildMindmap((topic) => topic.setFontWeight('bold')));

    const font = exportedTopic(doc).querySelector(':scope > font');
    expect(font?.getAttribute('BOLD')).toBe('true');
  });

  test('escapes multi-line text with XML special characters', async () => {
    const doc = await exportMindmap(
      buildMindmap((topic) => topic.setText('Revenue from R&D\nas a fraction < 1')),
    );

    const richcontent = exportedTopic(doc).querySelector(':scope > richcontent')!;
    expect(richcontent.getElementsByTagName('parsererror')).toHaveLength(0);
    const paragraphs = Array.from(richcontent.getElementsByTagName('p')).map((p) => p.textContent);
    expect(paragraphs).toEqual(['Revenue from R&D', 'as a fraction < 1']);
  });

  test('escapes notes with XML special characters', async () => {
    const doc = await exportMindmap(
      buildMindmap((topic) => topic.addFeature(new NoteModel({ text: 'Tom & Jerry <3' }))),
    );

    const richcontent = exportedTopic(doc).querySelector(':scope > richcontent[TYPE="NOTE"]')!;
    expect(richcontent.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(richcontent.getElementsByTagName('p')[0].textContent).toBe('Tom & Jerry <3');
  });

  test('keeps well formed rich text notes as markup', async () => {
    const doc = await exportMindmap(
      buildMindmap((topic) => {
        const note = new NoteModel({ text: '<p>Hello <b>world</b></p>' });
        note.setContentType(ContentType.HTML);
        topic.addFeature(note);
      }),
    );

    const richcontent = exportedTopic(doc).querySelector(':scope > richcontent[TYPE="NOTE"]')!;
    expect(richcontent.getElementsByTagName('b')[0].textContent).toBe('world');
  });
});
