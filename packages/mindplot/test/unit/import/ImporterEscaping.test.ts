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
import XMindImporter from '../../../src/components/import/XMindImporter';
import FreeplaneImporter from '../../../src/components/import/FreeplaneImporter';
import MindManagerImporter from '../../../src/components/import/MindManagerImporter';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import Mindmap from '../../../src/components/model/Mindmap';
import NoteModel from '../../../src/components/model/NoteModel';
import NodeModel from '../../../src/components/model/NodeModel';

// Values that come from the imported file, or from the user, must be escaped in the WiseMapping XML.

const MAP_NAME = `Bob's <map> & "co"`;
const NOTE = 'Before ]]> after <b>&amp;</b>';

const loadMindmap = (xml: string): Mindmap => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return XMLSerializerFactory.createFromDocument(doc).loadFromDom(doc, 'test');
};

const mapNameOf = (xml: string): string | null =>
  new DOMParser().parseFromString(xml, 'text/xml').documentElement.getAttribute('name');

const allNodes = (node: NodeModel): NodeModel[] => [node, ...node.getChildren().flatMap(allNodes)];

const findByText = (mindmap: Mindmap, text: string): NodeModel => {
  const result = mindmap
    .getBranches()
    .flatMap(allNodes)
    .find((node) => node.getText() === text);
  if (!result) {
    throw new Error(`Topic ${text} not found`);
  }
  return result;
};

const noteOf = (node: NodeModel): string =>
  (node.findFeatureByType('note')[0] as NoteModel | undefined)?.getText() ?? '';

describe('XMindImporter escaping', () => {
  test('XML format: escapes the map name and keeps notes containing "]]>"', async () => {
    const xmind = `<?xml version="1.0" encoding="UTF-8"?>
<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" version="2.0">
  <sheet id="sheet1">
    <topic id="root">
      <title>Root</title>
      <children>
        <topics type="attached">
          <topic id="a"><title>A &amp; 'B'</title><notes><plain>${NOTE.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</plain></notes></topic>
        </topics>
      </children>
    </topic>
  </sheet>
</xmap-content>`;

    const xml = await new XMindImporter(xmind).import(MAP_NAME);

    const mindmap = loadMindmap(xml);
    expect(mapNameOf(xml)).toBe(MAP_NAME);
    expect(noteOf(findByText(mindmap, `A & 'B'`))).toBe(NOTE);
  });

  test('JSON format: escapes the map name, the colors and keeps notes containing "]]>"', async () => {
    const sheet = {
      id: 'sheet1',
      class: 'sheet',
      rootTopic: {
        id: 'root',
        title: 'Root',
        children: {
          attached: [
            {
              id: 'a',
              title: `A & 'B'`,
              labels: [NOTE],
              style: { id: 's', properties: { 'svg:fill': `#fff' x='1` } },
            },
          ],
        },
      },
    };

    const xml = await new XMindImporter(JSON.stringify([sheet])).import(MAP_NAME);

    const mindmap = loadMindmap(xml);
    expect(mapNameOf(xml)).toBe(MAP_NAME);
    const topic = findByText(mindmap, `A & 'B'`);
    expect(noteOf(topic)).toContain(NOTE);
    expect(topic.getBackgroundColor()).toBe(`#fff' x='1`);
  });
});

describe('FreeplaneImporter escaping', () => {
  test('keeps notes whose HTML contains "]]>" (the end of a CDATA section)', async () => {
    const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root" ID="ID_1">
    <node TEXT="A &amp; 'B'" ID="ID_2">
      <richcontent TYPE="NOTE"><html><body><p><![CDATA[a < b]]></p></body></html></richcontent>
    </node>
  </node>
</map>`;

    const xml = await new FreeplaneImporter(freeplane).import(MAP_NAME);

    const mindmap = loadMindmap(xml);
    expect(mapNameOf(xml)).toBe(MAP_NAME);
    // The note is HTML: the text of the CDATA section is kept, escaped.
    expect(noteOf(findByText(mindmap, `A & 'B'`))).toContain('<p>a &lt; b</p>');
  });
});

describe('MindManagerImporter escaping', () => {
  test('escapes the map name and the color, and keeps notes containing "]]>"', async () => {
    const mindManager = `<?xml version="1.0" encoding="UTF-8"?>
<Map xmlns="http://www.mindjet.com/MindManager/MindMapXML/1.0">
  <Topic ID="1" Text="Root">
    <Topic ID="2" Text="A &amp; 'B'">
      <Notes>Before ]]&gt; after &lt;b&gt;&amp;amp;&lt;/b&gt;</Notes>
      <Color Value="#f00' x='1"/>
    </Topic>
  </Topic>
</Map>`;

    const xml = await new MindManagerImporter(mindManager).import(MAP_NAME);

    const mindmap = loadMindmap(xml);
    expect(mapNameOf(xml)).toBe(MAP_NAME);
    const topic = findByText(mindmap, `A & 'B'`);
    expect(noteOf(topic)).toBe(NOTE);
    expect(topic.getBackgroundColor()).toBe(`#f00' x='1`);
  });
});
