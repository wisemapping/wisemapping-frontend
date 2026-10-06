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
import { describe, expect, test } from '@jest/globals';
import Mindmap from '../../../src/components/model/Mindmap';
import NoteModel from '../../../src/components/model/NoteModel';
import ContentType from '../../../src/components/ContentType';
import FreemindExporter from '../../../src/components/export/FreemindExporter';
import FreeplaneExporter from '../../../src/components/export/FreeplaneExporter';
import FreemindImporter from '../../../src/components/import/FreemindImporter';
import FreeplaneImporter from '../../../src/components/import/FreeplaneImporter';
import XMLSerializerTango from '../../../src/components/persistence/XMLSerializerTango';

// A note as the note editor writes it: nested lists, a link, <br> and &nbsp; (not XML).
const NOTE =
  '<ul><li>one<ul><li>one.a&nbsp;<a href="https://example.org">site</a>' +
  '<ol><li>deep<br></li></ol></li></ul></li><li>two</li></ul><div>after</div>';

const buildMindmap = (): Mindmap => {
  const mindmap = new Mindmap('note-lists');
  const central = mindmap.createNode('CentralTopic', 1);
  central.setText('Central');
  const topic = mindmap.createNode('MainTopic', 2);
  topic.setText('Topic');
  topic.setPosition(200, 0);
  topic.setOrder(0);
  topic.addFeature(new NoteModel({ text: NOTE, contentType: ContentType.HTML }));
  central.append(topic);
  mindmap.addBranch(central);
  return mindmap;
};

// The structure of a note: its lists and items, with their own text.
const outline = (html: string): string => {
  const { body } = new DOMParser().parseFromString(html, 'text/html');
  const walk = (el: Element): string =>
    Array.from(el.children)
      .map((child) => {
        const tag = child.tagName.toLowerCase();
        if (tag === 'ul' || tag === 'ol') return `${tag}(${walk(child)})`;
        if (tag === 'li') {
          const own = Array.from(child.childNodes)
            .filter((n) => !['UL', 'OL'].includes((n as Element).tagName))
            .map((n) => n.textContent)
            .join('')
            .replace(/\s+/g, ' ')
            .trim();
          return `li[${own}]${walk(child)}`;
        }
        return walk(child);
      })
      .filter((part) => part !== '')
      .join(' ');
  return walk(body);
};

const EXPECTED = 'ul(li[one]ul(li[one.a site]ol(li[deep])) li[two])';

// The text of the note of topic 2 in an imported WiseMapping map.
const importedNote = (xml: string): string => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return doc.querySelector('topic[id="2"] > note')!.textContent;
};

describe('Notes with nested lists', () => {
  test('survive saving and loading a map', () => {
    const dom = new XMLSerializerTango().toXML(buildMindmap());
    const xml = new XMLSerializer().serializeToString(dom);
    const loaded = new XMLSerializerTango().loadFromDom(
      new DOMParser().parseFromString(xml, 'text/xml'),
      'note-lists',
    );

    const note = loaded
      .findNodeById(2)!
      .getFeatures()
      .find((f) => f.isOfType('note')) as NoteModel;
    expect(note.getText()).toBe(NOTE);
    expect(note.getContentType()).toBe(ContentType.HTML);
  });

  test('are exported to FreeMind as markup, even when the note is not well formed XML', async () => {
    const mm = await new FreemindExporter(buildMindmap()).export();
    const doc = new DOMParser().parseFromString(mm, 'text/xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);

    const body = doc.querySelector('node[ID="ID_2"] > richcontent[TYPE="NOTE"] body')!;
    expect(outline(body.innerHTML)).toBe(EXPECTED);
    expect(body.querySelector('a')!.getAttribute('href')).toBe('https://example.org');
  });

  test('survive a FreeMind export and import', async () => {
    const mm = await new FreemindExporter(buildMindmap()).export();
    const xml = await new FreemindImporter(mm).import('test', '');

    expect(outline(importedNote(xml))).toBe(EXPECTED);
  });

  test('survive a Freeplane export and import', async () => {
    const mm = await new FreeplaneExporter(buildMindmap()).export();
    const xml = await new FreeplaneImporter(mm).import('test', '');

    expect(outline(importedNote(xml))).toBe(EXPECTED);
  });
});
