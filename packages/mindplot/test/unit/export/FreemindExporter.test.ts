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
import ContentType from '../../../src/components/ContentType';
import FreemindExporter from '../../../src/components/export/FreemindExporter';
import FreemindImporter from '../../../src/components/import/FreemindImporter';
import EmojiIconModel from '../../../src/components/model/EmojiIconModel';
import SvgIconModel from '../../../src/components/model/SvgIconModel';
import LinkModel from '../../../src/components/model/LinkModel';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';

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
        topic.setConnectionColor('rgb(16,32,48)');
      }),
    );

    const node = exportedTopic(doc);
    expect(node.getAttribute('BACKGROUND_COLOR')).toBe('#ff0080');
    expect(node.querySelector(':scope > edge')!.getAttribute('COLOR')).toBe('#102030');
  });

  test('exports the connection color as the edge color, not the border color', async () => {
    const doc = await exportMindmap(
      buildMindmap((topic) => {
        topic.setShapeType('rectangle');
        topic.setBorderColor('#00ff00');
        topic.setConnectionColor('#ff0000');
      }),
    );

    const edges = Array.from(exportedTopic(doc).querySelectorAll(':scope > edge'));
    expect(edges.map((edge) => edge.getAttribute('COLOR'))).toEqual(['#ff0000']);
  });

  test('does not export the border color, FreeMind has no equivalent', async () => {
    const doc = await exportMindmap(
      buildMindmap((topic) => {
        topic.setShapeType('rectangle');
        topic.setBorderColor('#00ff00');
      }),
    );

    expect(exportedTopic(doc).querySelectorAll(':scope > edge')).toHaveLength(0);
  });

  test('connection colors survive a FreeMind export and import round trip', async () => {
    const mindmap = buildMindmap((topic) => {
      topic.setShapeType('rectangle');
      topic.setBorderColor('#00ff00');
      topic.setConnectionColor('#ff0000');
    });
    mindmap.getBranches()[0].setConnectionColor('#0000ff');
    const mm = await new FreemindExporter(mindmap).export();

    const xml = await new FreemindImporter(mm).import('test', '');
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const central = doc.querySelector('topic[id="1"]')!;
    const topic = doc.querySelector('topic[id="2"]')!;
    expect(central.getAttribute('connColor')).toBe('#0000ff');
    expect(topic.getAttribute('connColor')).toBe('#ff0000');
    expect(topic.getAttribute('brColor')).toBeNull();
  });

  test('exports the link and style of the central topic (BL5-12)', async () => {
    const mindmap = buildMindmap(() => undefined);
    const central = mindmap.getBranches()[0];
    central.setShapeType('rectangle');
    central.addFeature(new LinkModel({ url: 'https://www.wisemapping.com' }));

    const doc = await exportMindmap(mindmap);
    const root = doc.querySelector('map > node')!;
    expect(root.getAttribute('LINK')).toBe('https://www.wisemapping.com');
    expect(root.getAttribute('STYLE')).toBe('rectangle');

    // The link survives the round trip.
    const xml = await new FreemindImporter(await new FreemindExporter(mindmap).export()).import(
      'test',
      '',
    );
    const imported = new DOMParser().parseFromString(xml, 'text/xml');
    expect(imported.querySelector('topic[central="true"] > link')?.getAttribute('url')).toBe(
      'https://www.wisemapping.com',
    );
  });

  test('exports topics without a position on the right side', async () => {
    const mindmap = new Mindmap('test');
    const central = mindmap.createNode('CentralTopic', 1);
    central.setText('Central');
    const topic = mindmap.createNode('MainTopic', 2);
    topic.setText('Topic');
    central.append(topic);
    mindmap.addBranch(central);

    const doc = await exportMindmap(mindmap);
    expect(exportedTopic(doc).getAttribute('POSITION')).toBe('right');
  });

  test('exports topics at x = 0 on the right side, like the layout does', async () => {
    const doc = await exportMindmap(buildMindmap((topic) => topic.setPosition(0, 50)));

    expect(exportedTopic(doc).getAttribute('POSITION')).toBe('right');
  });

  test('exports topics with a negative x on the left side', async () => {
    const doc = await exportMindmap(buildMindmap((topic) => topic.setPosition(-200, 0)));

    expect(exportedTopic(doc).getAttribute('POSITION')).toBe('left');
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

  test('exports emoji icons as FreeMind builtin icons', async () => {
    const doc = await exportMindmap(
      buildMindmap((topic) => {
        topic.addFeature(new EmojiIconModel({ id: '💡' }));
        topic.addFeature(new EmojiIconModel({ id: '1️⃣' }));
        topic.addFeature(new EmojiIconModel({ id: '🟢' }));
      }),
    );

    const icons = Array.from(exportedTopic(doc).querySelectorAll(':scope > icon'));
    expect(icons.map((icon) => icon.getAttribute('BUILTIN'))).toEqual(['idea', 'full-1', 'go']);
  });

  test('exports WiseMapping icons as the equivalent FreeMind builtin icon', async () => {
    const doc = await exportMindmap(
      buildMindmap((topic) => {
        topic.addFeature(new SvgIconModel({ id: 'sign_warning' }));
        topic.addFeature(new SvgIconModel({ id: 'sign_info' }));
        topic.addFeature(new SvgIconModel({ id: 'time_clock' }));
        topic.addFeature(new SvgIconModel({ id: 'flag_blue' }));
      }),
    );

    const icons = Array.from(exportedTopic(doc).querySelectorAll(':scope > icon'));
    expect(icons.map((icon) => icon.getAttribute('BUILTIN'))).toEqual([
      'messagebox_warning',
      'info',
      'clock',
      'flag-blue',
    ]);
  });

  test('keeps the id of WiseMapping icons that have no FreeMind builtin equivalent', async () => {
    const mm = await new FreemindExporter(
      buildMindmap((topic) => {
        topic.addFeature(new SvgIconModel({ id: 'tag_blue' }));
        topic.addFeature(new SvgIconModel({ id: 'flag_purple' }));
      }),
    ).export();

    const exported = new DOMParser().parseFromString(mm, 'text/xml');
    const icons = Array.from(exportedTopic(exported).querySelectorAll(':scope > icon'));
    expect(icons.map((icon) => icon.getAttribute('BUILTIN'))).toEqual(['tag_blue', 'flag_purple']);

    // They are imported back as the same WiseMapping icons.
    const xml = await new FreemindImporter(mm).import('test', '');
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const imported = Array.from(doc.querySelectorAll('topic[id="2"] > icon'));
    expect(imported.map((icon) => icon.getAttribute('id'))).toEqual(['tag_blue', 'flag_purple']);
  });

  test('the blue flag survives a FreeMind export and import round trip (BL5-14)', async () => {
    const mm = await new FreemindExporter(
      buildMindmap((topic) => topic.addFeature(new SvgIconModel({ id: 'flag_blue' }))),
    ).export();

    const xml = await new FreemindImporter(mm).import('test', '');
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const topic = doc.querySelector('topic[id="2"]')!;
    expect(topic.querySelector(':scope > icon')?.getAttribute('id')).toBe('flag_blue');
    expect(topic.querySelectorAll(':scope > eicon')).toHaveLength(0);
  });

  test.each(['flag_green', 'flag_yellow', 'flag_orange', 'flag_pink'])(
    'the %s icon survives a FreeMind export and import round trip (BL5-113)',
    async (iconId: string) => {
      const mm = await new FreemindExporter(
        buildMindmap((topic) => topic.addFeature(new SvgIconModel({ id: iconId }))),
      ).export();
      expect(mm).toContain(`BUILTIN="${iconId.replace('_', '-')}"`);

      const xml = await new FreemindImporter(mm).import('test', '');
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const topic = doc.querySelector('topic[id="2"]')!;
      expect(topic.querySelector(':scope > icon')?.getAttribute('id')).toBe(iconId);
      expect(topic.querySelectorAll(':scope > eicon')).toHaveLength(0);
    },
  );

  test('exports emoji icons written without the emoji variation selector', async () => {
    const doc = await exportMindmap(
      buildMindmap((topic) => topic.addFeature(new EmojiIconModel({ id: '\u26A0' }))),
    );

    const icon = exportedTopic(doc).querySelector(':scope > icon');
    expect(icon?.getAttribute('BUILTIN')).toBe('messagebox_warning');
  });

  test('skips emoji icons that have no FreeMind builtin equivalent', async () => {
    const doc = await exportMindmap(
      buildMindmap((topic) => topic.addFeature(new EmojiIconModel({ id: '🦄' }))),
    );

    expect(exportedTopic(doc).querySelectorAll(':scope > icon')).toHaveLength(0);
  });

  test('emoji icons survive a FreeMind export and import round trip', async () => {
    const mm = await new FreemindExporter(
      buildMindmap((topic) => {
        topic.addFeature(new EmojiIconModel({ id: '✅' }));
        topic.addFeature(new EmojiIconModel({ id: '⚠️' }));
      }),
    ).export();

    const xml = await new FreemindImporter(mm).import('test', '');
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const icons = Array.from(doc.querySelectorAll('topic[id="2"] > eicon'));
    expect(icons.map((icon) => icon.getAttribute('id'))).toEqual(['✅', '⚠️']);
  });

  test.each([6, 8, 10, 15])(
    'the text color and font survive a FreeMind export and import round trip, size %p (BL5-156)',
    async (size: number) => {
      const mindmap = buildMindmap((topic) => {
        topic.setFontColor('#00ff00');
        topic.setFontFamily('Verdana');
        topic.setFontSize(size);
        topic.setFontWeight('bold');
        topic.setFontStyle('italic');
      });
      const central = mindmap.getBranches()[0];
      central.setFontColor('#990000');
      central.setFontFamily('Georgia');
      // The exporter only writes a font with a size, weight or style: a family alone is dropped.
      central.setFontSize(10);

      const xml = await new FreemindImporter(await new FreemindExporter(mindmap).export()).import(
        'test',
        '',
      );
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const imported = XMLSerializerFactory.createFromDocument(doc).loadFromDom(doc, 'test');
      const importedCentral = imported.getCentralTopic();
      expect(importedCentral.getFontColor()).toBe('#990000');
      expect(importedCentral.getFontFamily()).toBe('Georgia');
      expect(importedCentral.getFontSize()).toBe(10);

      const [topic] = importedCentral.getChildren();
      expect(topic.getFontColor()).toBe('#00ff00');
      expect(topic.getFontFamily()).toBe('Verdana');
      // Size 8 is exported as 12, the FreeMind default size: it imports as the theme size.
      expect(topic.getFontSize()).toBe(size === 8 ? undefined : size);
      expect(topic.getFontWeight()).toBe('bold');
      expect(topic.getFontStyle()).toBe('italic');
    },
  );
});
