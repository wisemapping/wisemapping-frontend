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
import { strToU8, zipSync } from 'fflate';
import MindManagerImporter from '../../../src/components/import/MindManagerImporter';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';
import NoteModel from '../../../src/components/model/NoteModel';
import LinkModel from '../../../src/components/model/LinkModel';
import EmojiIconModel from '../../../src/components/model/EmojiIconModel';

const loadMindmap = (xml: string): Mindmap => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return XMLSerializerFactory.createFromDocument(doc).loadFromDom(doc, 'test');
};

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

// The Document.xml of a .mmap file written by MindManager.
const DOCUMENT_XML = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<ap:Map xmlns:ap="http://schemas.mindjet.com/MindManager/Application/2003" OId="map">
  <ap:OneTopic>
    <ap:Topic OId="t1">
      <ap:SubTopics>
        <ap:Topic OId="t2">
          <ap:Text PlainText="Child A"/>
          <ap:NotesGroup><ap:NotesXhtmlData PreviewPlainText="Note of A"/></ap:NotesGroup>
          <ap:Hyperlink Url="https://example.com"/>
          <ap:SubTopics>
            <ap:Topic OId="t4"><ap:Text PlainText="Grandchild"/></ap:Topic>
          </ap:SubTopics>
        </ap:Topic>
        <ap:Topic OId="t3"><ap:Text PlainText="Child B"/></ap:Topic>
      </ap:SubTopics>
      <ap:Text PlainText="Central"/>
    </ap:Topic>
  </ap:OneTopic>
  <ap:Relationships>
    <ap:Relationship OId="r1">
      <ap:ConnectionGroup Index="0"><ap:Connection><ap:ObjectReference OIdRef="t2"/></ap:Connection></ap:ConnectionGroup>
      <ap:ConnectionGroup Index="1"><ap:Connection><ap:ObjectReference OIdRef="t3"/></ap:Connection></ap:ConnectionGroup>
    </ap:Relationship>
  </ap:Relationships>
</ap:Map>`;

const mmapArchive = (): Uint8Array =>
  zipSync({
    'Document.xml': strToU8(DOCUMENT_XML),
    'xsd/MMBase.xsd': strToU8('<xs:schema/>'),
  });

describe('MindManagerImporter .mmap archives', () => {
  test('imports the Document.xml of a ZIP archive', async () => {
    const archive = mmapArchive();
    const importer = TextImporterFactory.create('mmap', archive.buffer as ArrayBuffer);

    const mindmap = loadMindmap(await importer.import('test', ''));

    const central = mindmap.getCentralTopic();
    expect(central.getText()).toBe('Central');
    expect(central.getChildren().map((c) => c.getText())).toEqual(['Child A', 'Child B']);

    const childA = findByText(mindmap, 'Child A');
    expect(childA.getChildren().map((c) => c.getText())).toEqual(['Grandchild']);
    expect((childA.findFeatureByType('note')[0] as NoteModel).getText()).toBe('Note of A');
    expect((childA.findFeatureByType('link')[0] as LinkModel).getUrl()).toBe('https://example.com');

    const relationships = mindmap.getRelationships();
    expect(relationships).toHaveLength(1);
    expect(relationships[0].getFromNode()).toBe(childA.getId());
    expect(relationships[0].getToNode()).toBe(findByText(mindmap, 'Child B').getId());
  });

  test('still imports a plain XML file', async () => {
    const importer = TextImporterFactory.create('mmap', DOCUMENT_XML);

    const mindmap = loadMindmap(await importer.import('test', ''));

    expect(mindmap.getCentralTopic().getChildren()).toHaveLength(2);
  });
});

describe('MindManagerImporter icons', () => {
  test('maps the letter icons', async () => {
    const mindManager = `<?xml version="1.0" encoding="UTF-8"?>
<Map xmlns="http://www.mindjet.com/MindManager/MindMapXML/1.0">
  <Topic ID="1" Text="Root">
    <Topic ID="2" Text="Letter"><Icon Name="A"/></Topic>
  </Topic>
</Map>`;

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const icons = findByText(mindmap, 'Letter').findFeatureByType('eicon');
    expect((icons[0] as EmojiIconModel).getIconType()).toBe('🅰️');
  });
});
