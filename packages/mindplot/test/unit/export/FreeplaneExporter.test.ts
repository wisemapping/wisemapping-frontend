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
import NodeModel from '../../../src/components/model/NodeModel';
import NoteModel from '../../../src/components/model/NoteModel';
import LinkModel from '../../../src/components/model/LinkModel';
import EmojiIconModel from '../../../src/components/model/EmojiIconModel';
import SvgIconModel from '../../../src/components/model/SvgIconModel';
import { StrokeStyle } from '../../../src/components/model/RelationshipModel';
import ContentType from '../../../src/components/ContentType';
import FreeplaneExporter from '../../../src/components/export/FreeplaneExporter';
import TextExporterFactory from '../../../src/components/export/TextExporterFactory';
import FreeplaneImporter from '../../../src/components/import/FreeplaneImporter';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';

// Central topic 1, with A (2, right) and B (3, left), and B1 (4) under B.
const buildMindmap = (): { mindmap: Mindmap; topics: NodeModel[] } => {
  const mindmap = new Mindmap('freeplane');
  const central = mindmap.createNode('CentralTopic', 1);
  central.setText('Central');
  mindmap.addBranch(central);

  const add = (parent: NodeModel, id: number, text: string, x: number): NodeModel => {
    const topic = mindmap.createNode('MainTopic', id);
    topic.setText(text);
    topic.setPosition(x, 0);
    topic.setOrder(parent.getChildren().length);
    parent.append(topic);
    return topic;
  };
  const a = add(central, 2, 'A', 200);
  const b = add(central, 3, 'B', -200);
  const b1 = add(b, 4, 'B1', -400);
  return { mindmap, topics: [central, a, b, b1] };
};

const exportXml = async (mindmap: Mindmap): Promise<string> =>
  new FreeplaneExporter(mindmap).export();

const exportDoc = async (mindmap: Mindmap): Promise<Document> => {
  const doc = new DOMParser().parseFromString(await exportXml(mindmap), 'text/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return doc;
};

const nodeOf = (doc: Document, id: number): Element => doc.querySelector(`node[ID="ID_${id}"]`)!;

// Exports the map and imports it back with the Freeplane importer.
const roundTrip = async (mindmap: Mindmap): Promise<Document> => {
  const xml = await new FreeplaneImporter(await exportXml(mindmap)).import('test', '');
  return new DOMParser().parseFromString(xml, 'text/xml');
};

// Multi-line texts are written as a <text> child instead of the text attribute.
const textOf = (topic: Element): string | null =>
  topic.getAttribute('text') ?? topic.querySelector(':scope > text')?.textContent ?? null;

const topicByText = (doc: Document, text: string): Element =>
  Array.from(doc.querySelectorAll('topic')).find((t) => textOf(t) === text)!;

describe('FreeplaneExporter', () => {
  test('writes a Freeplane map of the mindmap topics', async () => {
    const { mindmap } = buildMindmap();
    const xml = await exportXml(mindmap);

    expect(xml.startsWith('<map version="freeplane 1.9.13">')).toBe(true);
    const doc = await exportDoc(mindmap);
    const root = doc.querySelector('map > node')!;
    expect(root.getAttribute('TEXT')).toBe('Central');
    expect(
      Array.from(root.querySelectorAll(':scope > node')).map((n) => [
        n.getAttribute('TEXT'),
        n.getAttribute('POSITION'),
      ]),
    ).toEqual([
      ['A', 'right'],
      ['B', 'left'],
    ]);
    expect(nodeOf(doc, 3).querySelector(':scope > node')?.getAttribute('TEXT')).toBe('B1');
  });

  test('is the mmx text exporter, an xml file', () => {
    const exporter = TextExporterFactory.create('mmx', buildMindmap().mindmap);
    expect(exporter).toBeInstanceOf(FreeplaneExporter);
    expect(exporter.extension()).toBe('mmx');
    expect(exporter.getContentType()).toBe('application/xml');
  });

  test('topics, text, notes and links survive a Freeplane round trip', async () => {
    const { mindmap, topics } = buildMindmap();
    const [central, a, b] = topics;
    central.addFeature(new LinkModel({ url: 'https://www.wisemapping.com' }));
    a.addFeature(new NoteModel({ text: 'Plain & <simple> note' }));
    b.addFeature(new NoteModel({ text: '<p>Rich <b>note</b></p>', contentType: ContentType.HTML }));
    a.addFeature(new LinkModel({ url: 'https://www.freeplane.org' }));

    const doc = await roundTrip(mindmap);

    const root = doc.querySelector('topic[central="true"]')!;
    expect(root.getAttribute('text')).toBe('Central');
    expect(root.querySelector(':scope > link')?.getAttribute('url')).toBe(
      'https://www.wisemapping.com',
    );
    expect(
      Array.from(root.querySelectorAll(':scope > topic')).map((t) => t.getAttribute('text')),
    ).toEqual(['A', 'B']);
    expect(topicByText(doc, 'B').querySelector(':scope > topic')?.getAttribute('text')).toBe('B1');

    const noteText = (text: string): string => {
      const html = topicByText(doc, text).querySelector(':scope > note')?.textContent || '';
      return (new DOMParser().parseFromString(html, 'text/html').body.textContent || '').trim();
    };
    expect(noteText('A')).toBe('Plain & <simple> note');
    expect(noteText('B')).toBe('Rich note');
    expect(topicByText(doc, 'A').querySelector(':scope > link')?.getAttribute('url')).toBe(
      'https://www.freeplane.org',
    );
  });

  test('multi-line and rich text topics keep their text on a round trip', async () => {
    const { mindmap, topics } = buildMindmap();
    topics[1].setText('first line\nsecond line');
    topics[2].setText('<p>Rich <b>topic</b></p>');
    topics[2].setContentType(ContentType.HTML);

    const exported = await exportDoc(mindmap);
    expect(nodeOf(exported, 2).getAttribute('TEXT')).toBe('first line\nsecond line');
    // Rich text is kept as html for Freeplane, with its plain text as TEXT.
    const rich = nodeOf(exported, 3);
    expect(rich.getAttribute('TEXT')).toBe('Rich topic');
    expect(rich.querySelector(':scope > richcontent[TYPE="NODE"] b')?.textContent).toBe('topic');

    const doc = await roundTrip(mindmap);
    expect(topicByText(doc, 'first line\nsecond line')).toBeDefined();
    expect(topicByText(doc, 'Rich topic')).toBeDefined();
  });

  test('icons with a Freeplane equivalent survive a round trip', async () => {
    const { mindmap, topics } = buildMindmap();
    ['💡', '📅', '🕐', '📁', '🐧', 'ℹ️'].forEach((emoji) =>
      topics[1].addFeature(new EmojiIconModel({ id: emoji })),
    );

    const exported = await exportDoc(mindmap);
    expect(
      Array.from(nodeOf(exported, 2).querySelectorAll(':scope > icon')).map((i) =>
        i.getAttribute('BUILTIN'),
      ),
    ).toEqual(['idea', 'calendar', 'clock', 'folder', 'penguin', 'info']);

    const doc = await roundTrip(mindmap);
    expect(
      Array.from(topicByText(doc, 'A').querySelectorAll(':scope > eicon')).map((i) =>
        i.getAttribute('id'),
      ),
    ).toEqual(['💡', '📅', '🕐', '📁', '🐧', 'ℹ️']);
  });

  test('emoji and WiseMapping icons survive a round trip (BL5-112)', async () => {
    const { mindmap, topics } = buildMindmap();
    ['🦄', '👨‍💻', '✅', '❤️', '1️⃣'].forEach((emoji) =>
      topics[1].addFeature(new EmojiIconModel({ id: emoji })),
    );
    ['flag_green', 'tag_blue'].forEach((id) => topics[1].addFeature(new SvgIconModel({ id })));

    const doc = await roundTrip(mindmap);
    const topic = topicByText(doc, 'A');
    expect(
      Array.from(topic.querySelectorAll(':scope > eicon')).map((i) => i.getAttribute('id')),
    ).toEqual(['🦄', '👨‍💻', '✅', '❤️', '1️⃣']);
    expect(
      Array.from(topic.querySelectorAll(':scope > icon')).map((i) => i.getAttribute('id')),
    ).toEqual(['flag_green', 'tag_blue']);
  });

  test('exports emoji without a builtin icon as Freeplane emoji icons', async () => {
    const { mindmap, topics } = buildMindmap();
    topics[1].addFeature(new EmojiIconModel({ id: '🦄' }));
    topics[1].addFeature(new EmojiIconModel({ id: '👨‍💻' }));
    topics[1].addFeature(new EmojiIconModel({ id: '✅' }));

    const doc = await exportDoc(mindmap);
    expect(
      Array.from(nodeOf(doc, 2).querySelectorAll(':scope > icon')).map((i) =>
        i.getAttribute('BUILTIN'),
      ),
    ).toEqual(['emoji-1F984', 'emoji-1F468-200D-1F4BB', 'button_ok']);
  });

  test('exports colors, fonts, shapes and the collapsed state', async () => {
    const { mindmap, topics } = buildMindmap();
    const [central, a, b, b1] = topics;
    central.setShapeType('elipse');
    a.setShapeType('rectangle');
    a.setBackgroundColor('rgb(255, 0, 128)');
    a.setFontColor('#00ff00');
    a.setConnectionColor('#0000ff');
    a.setFontFamily('Verdana');
    a.setFontSize(15);
    a.setFontWeight('bold');
    a.setFontStyle('italic');
    b.setShapeType('rounded rectangle');
    b.setChildrenShrunken(true);
    b1.setShapeType('line');
    b1.setFontStyle('italic');

    const doc = await exportDoc(mindmap);

    expect(nodeOf(doc, 1).getAttribute('STYLE')).toBe('oval');
    const nodeA = nodeOf(doc, 2);
    expect(nodeA.getAttribute('STYLE')).toBe('rectangle');
    expect(nodeA.getAttribute('BACKGROUND_COLOR')).toBe('#ff0080');
    expect(nodeA.getAttribute('COLOR')).toBe('#00ff00');
    expect(nodeA.querySelector(':scope > edge')?.getAttribute('COLOR')).toBe('#0000ff');
    const font = nodeA.querySelector(':scope > font')!;
    expect(font.getAttribute('NAME')).toBe('Verdana');
    expect(font.getAttribute('SIZE')).toBe('24');
    expect(font.getAttribute('BOLD')).toBe('true');
    expect(font.getAttribute('ITALIC')).toBe('true');

    const nodeB = nodeOf(doc, 3);
    expect(nodeB.getAttribute('STYLE')).toBe('bubble');
    expect(nodeB.getAttribute('FOLDED')).toBe('true');
    expect(nodeA.getAttribute('FOLDED')).toBeNull();

    const nodeB1 = nodeOf(doc, 4);
    expect(nodeB1.getAttribute('STYLE')).toBe('fork');
    // A font with only a style is still written.
    expect(nodeB1.querySelector(':scope > font')?.getAttribute('ITALIC')).toBe('true');
  });

  test('colors, fonts, shapes and the collapsed state survive a round trip (BL5-112)', async () => {
    const { mindmap, topics } = buildMindmap();
    const [central, a, b, b1] = topics;
    central.setShapeType('elipse');
    a.setShapeType('rectangle');
    a.setBackgroundColor('rgb(255, 0, 128)');
    a.setFontColor('#00ff00');
    a.setConnectionColor('#0000ff');
    a.setFontFamily('Verdana');
    a.setFontSize(15);
    a.setFontWeight('bold');
    a.setFontStyle('italic');
    b.setShapeType('rounded rectangle');
    b.setChildrenShrunken(true);
    b1.setShapeType('line');
    b1.setFontStyle('italic');

    const doc = await roundTrip(mindmap);

    expect(doc.querySelector('topic[central="true"]')?.getAttribute('shape')).toBe('elipse');
    const topicA = topicByText(doc, 'A');
    expect(topicA.getAttribute('shape')).toBe('rectangle');
    expect(topicA.getAttribute('bgColor')).toBe('#ff0080');
    expect(topicA.getAttribute('connColor')).toBe('#0000ff');
    expect(topicA.getAttribute('fontStyle')).toBe('Verdana;15;#00ff00;bold;italic;');
    expect(topicA.getAttribute('shrink')).toBeNull();

    const topicB = topicByText(doc, 'B');
    expect(topicB.getAttribute('shape')).toBe('rounded rectangle');
    expect(topicB.getAttribute('shrink')).toBe('true');

    const topicB1 = topicByText(doc, 'B1');
    expect(topicB1.getAttribute('shape')).toBe('line');
    // The size Freeplane needs with any font is not imported: the theme size is kept.
    expect(topicB1.getAttribute('fontStyle')).toBe(';;;;italic;');
  });

  test('exports relationships as arrowlinks with their arrows, color and dash', async () => {
    const { mindmap } = buildMindmap();
    const dashed = mindmap.createRelationship(2, 4);
    dashed.setStrokeStyle(StrokeStyle.DASHED);
    dashed.setStrokeColor('#ff0000');
    dashed.setEndArrow(true);
    dashed.setStartArrow(false);
    mindmap.addRelationship(dashed);
    const dotted = mindmap.createRelationship(3, 2);
    dotted.setStrokeStyle(StrokeStyle.DOTTED);
    dotted.setEndArrow(false);
    dotted.setStartArrow(true);
    mindmap.addRelationship(dotted);

    const doc = await exportDoc(mindmap);
    const first = nodeOf(doc, 2).querySelector(':scope > arrowlink')!;
    expect(first.getAttribute('DESTINATION')).toBe('ID_4');
    expect(first.getAttribute('DASH')).toBe('7 7');
    expect(first.getAttribute('COLOR')).toBe('#ff0000');
    expect(first.getAttribute('STARTARROW')).toBe('None');
    expect(first.getAttribute('ENDARROW')).toBe('Default');
    const second = nodeOf(doc, 3).querySelector(':scope > arrowlink')!;
    expect(second.getAttribute('DESTINATION')).toBe('ID_2');
    expect(second.getAttribute('DASH')).toBe('3 3');
    expect(second.getAttribute('STARTARROW')).toBe('Default');
    expect(second.getAttribute('ENDARROW')).toBe('None');

    // The relationships and their stroke style survive the round trip.
    const imported = await roundTrip(mindmap);
    const relationships = Array.from(imported.querySelectorAll('relationship'));
    const text = (id: string | null): string | null =>
      textOf(imported.querySelector(`topic[id="${id}"]`)!);
    expect(
      relationships.map((r) => [
        text(r.getAttribute('srcTopicId')),
        text(r.getAttribute('destTopicId')),
        r.getAttribute('strokeStyle'),
      ]),
    ).toEqual([
      ['A', 'B1', 'dashed'],
      ['B', 'A', 'dotted'],
    ]);
  });

  test('the export is imported as a Freeplane map by the importer factory', async () => {
    const xml = await exportXml(buildMindmap().mindmap);
    const importer = TextImporterFactory.create('mmx', xml);
    expect(importer).toBeInstanceOf(FreeplaneImporter);
    expect(TextImporterFactory.create('mm', xml)).toBeInstanceOf(FreeplaneImporter);
  });
});
