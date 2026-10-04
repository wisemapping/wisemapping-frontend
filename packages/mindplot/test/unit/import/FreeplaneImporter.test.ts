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
import FreeplaneImporter from '../../../src/components/import/FreeplaneImporter';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';
import NoteModel from '../../../src/components/model/NoteModel';
import LinkModel from '../../../src/components/model/LinkModel';
import EmojiIconModel from '../../../src/components/model/EmojiIconModel';
import ContentType from '../../../src/components/ContentType';

const loadMindmap = (xml: string): Mindmap => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return XMLSerializerFactory.createFromDocument(doc).loadFromDom(doc, 'test');
};

const centralOf = (mindmap: Mindmap): NodeModel => mindmap.getCentralTopic() as NodeModel;

const noteOf = (node: NodeModel): NoteModel | undefined =>
  node.findFeatureByType('note')[0] as NoteModel | undefined;

describe('FreeplaneImporter notes', () => {
  const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root" ID="ID_1">
    <node TEXT="A" ID="ID_2">
      <richcontent TYPE="NOTE">
        <html><head></head><body><p>Hello <b>world</b></p><img src="x" onerror="alert(1)"/></body></html>
      </richcontent>
    </node>
  </node>
</map>`;

  test('imports the note as sanitized HTML', async () => {
    const mindmap = loadMindmap(await new FreeplaneImporter(freeplane).import('test'));

    const note = noteOf(centralOf(mindmap).getChildren()[0]);
    expect(note).toBeDefined();
    expect(note!.getContentType()).toBe(ContentType.HTML);
    expect(note!.getText()).toContain('<p>Hello <b>world</b></p>');
    expect(note!.getText()).not.toContain('onerror');
    expect(note!.getText()).not.toContain('<html');
  });
});

describe('FreeplaneImporter central topic', () => {
  const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root" ID="ID_1" LINK="https://example.com/root">
    <icon BUILTIN="idea"/>
    <richcontent TYPE="NOTE"><html><body><p>Root note</p></body></html></richcontent>
    <node TEXT="A" ID="ID_2"/>
  </node>
</map>`;

  test('imports the notes, icons and links of the central topic', async () => {
    const mindmap = loadMindmap(await new FreeplaneImporter(freeplane).import('test'));

    const central = centralOf(mindmap);
    expect(noteOf(central)?.getText()).toContain('Root note');
    expect(
      central.findFeatureByType('eicon').map((icon) => (icon as EmojiIconModel).getIconType()),
    ).toEqual(['💡']);
    expect((central.findFeatureByType('link')[0] as LinkModel | undefined)?.getUrl()).toBe(
      'https://example.com/root',
    );
  });
});
