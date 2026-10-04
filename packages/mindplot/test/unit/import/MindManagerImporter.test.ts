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
import { StrokeStyle } from '../../../src/components/model/RelationshipModel';
import ContentType from '../../../src/components/ContentType';

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

const iconsOf = (node: NodeModel): string[] =>
  node.findFeatureByType('eicon').map((icon) => (icon as EmojiIconModel).getIconType());

describe('MindManagerImporter central topic', () => {
  test('imports the notes, icons and links of the central topic', async () => {
    const mindManager = `<?xml version="1.0" encoding="UTF-8"?>
<Map xmlns="http://www.mindjet.com/MindManager/MindMapXML/1.0">
  <Topic ID="1" Text="Root">
    <Notes>Root note</Notes>
    <Hyperlink URL="https://example.com/root"/>
    <Icon Name="star"/>
    <Topic ID="2" Text="Child"/>
  </Topic>
</Map>`;

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const central = findByText(mindmap, 'Root');
    expect((central.findFeatureByType('note')[0] as NoteModel | undefined)?.getText()).toBe(
      'Root note',
    );
    expect((central.findFeatureByType('link')[0] as LinkModel | undefined)?.getUrl()).toBe(
      'https://example.com/root',
    );
    expect(iconsOf(central)).toEqual(['⭐']);
  });
});

describe('MindManagerImporter topic ids', () => {
  test('topics without an id neither shift the ids nor take the id of another topic', async () => {
    // The second child has no ID: it must not be mistaken for the central topic (ID 1).
    const mindManager = `<?xml version="1.0" encoding="UTF-8"?>
<Map xmlns="http://www.mindjet.com/MindManager/MindMapXML/1.0">
  <Topic ID="1" Text="Root">
    <Topic Text="No id"/>
    <Topic ID="3" Text="Three"/>
  </Topic>
  <Relationships>
    <Relationship FromTopicID="1" ToTopicID="3"/>
  </Relationships>
</Map>`;

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const central = findByText(mindmap, 'Root');
    expect(central.getId()).toBe(1);
    expect(findByText(mindmap, 'No id').getId()).toBe(2);
    expect(findByText(mindmap, 'Three').getId()).toBe(3);

    const relationships = mindmap.getRelationships();
    expect(relationships).toHaveLength(1);
    expect(relationships[0].getFromNode()).toBe(central.getId());
    expect(relationships[0].getToNode()).toBe(findByText(mindmap, 'Three').getId());
  });
});

// Follows the MindManager Application schema (MindManagerApplication.xsd, 2003 namespace): Topic
// has SubTopics, FloatingTopics, Text, Color (ARGB FillColor/LineColor), Offset, IconsGroup
// (Icons/Icon xsi:type="ap:StockIcon" IconType="urn:mindjet:...") and Task (TaskPriority).
const SCHEMA_DOCUMENT_XML = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<ap:Map xmlns:ap="http://schemas.mindjet.com/MindManager/Application/2003" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" OId="map">
  <ap:OneTopic>
    <ap:Topic OId="root">
      <ap:SubTopics>
        <ap:Topic OId="a">
          <ap:Text PlainText="Colored"/>
          <ap:Color FillColor="ff96b3df" LineColor="ffc6c6c6"/>
          <ap:IconsGroup>
            <ap:Icons>
              <ap:Icon xsi:type="ap:StockIcon" IconType="urn:mindjet:SmileyHappy"/>
              <ap:Icon xsi:type="ap:StockIcon" IconType="urn:mindjet:Lightbulb"/>
            </ap:Icons>
          </ap:IconsGroup>
          <ap:Task TaskPriority="urn:mindjet:Prio1"/>
        </ap:Topic>
        <ap:Topic OId="b">
          <ap:Text PlainText="Transparent"/>
          <ap:Color FillColor="00000000"/>
        </ap:Topic>
      </ap:SubTopics>
      <ap:FloatingTopics>
        <ap:Topic OId="f">
          <ap:SubTopics>
            <ap:Topic OId="fc"><ap:Text PlainText="Floating child"/></ap:Topic>
          </ap:SubTopics>
          <ap:Text PlainText="Floating"/>
          <ap:Offset CX="100" CY="-50"/>
        </ap:Topic>
      </ap:FloatingTopics>
      <ap:Text PlainText="Central"/>
      <ap:IconsGroup>
        <ap:Icons><ap:Icon xsi:type="ap:StockIcon" IconType="urn:mindjet:FlagGreen"/></ap:Icons>
      </ap:IconsGroup>
    </ap:Topic>
  </ap:OneTopic>
  <ap:Relationships>
    <ap:Relationship OId="r1">
      <ap:ConnectionGroup Index="0"><ap:Connection><ap:ObjectReference OIdRef="a"/></ap:Connection></ap:ConnectionGroup>
      <ap:ConnectionGroup Index="1"><ap:Connection><ap:ObjectReference OIdRef="f"/></ap:Connection></ap:ConnectionGroup>
    </ap:Relationship>
  </ap:Relationships>
</ap:Map>`;

describe('MindManagerImporter document schema', () => {
  test('maps stock icons, the task priority and the icons of the central topic', async () => {
    const mindmap = loadMindmap(await new MindManagerImporter(SCHEMA_DOCUMENT_XML).import('test'));

    expect(iconsOf(findByText(mindmap, 'Colored'))).toEqual(['😃', '💡', '🔴']);
    expect(iconsOf(findByText(mindmap, 'Central'))).toEqual(['🟢']);
  });

  test('maps the ARGB fill and line colors, ignoring transparent ones', async () => {
    const mindmap = loadMindmap(await new MindManagerImporter(SCHEMA_DOCUMENT_XML).import('test'));

    const colored = findByText(mindmap, 'Colored');
    expect(colored.getBackgroundColor()).toBe('#96b3df');
    expect(colored.getBorderColor()).toBe('#c6c6c6');

    const transparent = findByText(mindmap, 'Transparent');
    expect(transparent.getBackgroundColor()).toBeUndefined();
    expect(transparent.getBorderColor()).toBeUndefined();
  });

  test('imports floating topics as isolated topics with their children', async () => {
    const mindmap = loadMindmap(await new MindManagerImporter(SCHEMA_DOCUMENT_XML).import('test'));

    const floating = findByText(mindmap, 'Floating');
    expect(mindmap.getBranches()).toContain(floating);
    expect(floating.getParent()).toBeFalsy();
    expect(floating.getChildren().map((c) => c.getText())).toEqual(['Floating child']);
    // Offsets are in millimeters.
    expect(floating.getPosition()).toEqual({ x: 378, y: -189 });

    const relationships = mindmap.getRelationships();
    expect(relationships).toHaveLength(1);
    expect(relationships[0].getToNode()).toBe(floating.getId());
  });
});

const schemaMap = (topics: string, rest = ''): string =>
  `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<ap:Map xmlns:ap="http://schemas.mindjet.com/MindManager/Application/2003" OId="map">
  <ap:OneTopic>
    <ap:Topic OId="root">
      <ap:SubTopics>${topics}</ap:SubTopics>
      <ap:Text PlainText="Central"/>
    </ap:Topic>
  </ap:OneTopic>
  ${rest}
</ap:Map>`;

describe('MindManagerImporter XHTML notes', () => {
  test('imports the XHTML body of the note as sanitized HTML', async () => {
    const mindManager = schemaMap(`
        <ap:Topic OId="a">
          <ap:Text PlainText="Rich"/>
          <ap:NotesGroup>
            <ap:NotesXhtmlData PreviewPlainText="Hello world">
              <html xmlns="http://www.w3.org/1999/xhtml"><body><p>Hello <b>world</b></p><img src="x" onerror="alert(1)"/></body></html>
            </ap:NotesXhtmlData>
          </ap:NotesGroup>
        </ap:Topic>`);

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const note = findByText(mindmap, 'Rich').findFeatureByType('note')[0] as NoteModel;
    expect(note.getContentType()).toBe(ContentType.HTML);
    expect(note.getText()).toContain('<p>Hello <b>world</b></p>');
    expect(note.getText()).not.toContain('onerror');
    expect(note.getText()).not.toContain('xmlns');
    expect(note.getText()).not.toContain('<html');
  });

  test('falls back to the preview text when the note has no XHTML body', async () => {
    const mindManager = schemaMap(`
        <ap:Topic OId="a">
          <ap:Text PlainText="Plain"/>
          <ap:NotesGroup><ap:NotesXhtmlData PreviewPlainText="Only a preview"/></ap:NotesGroup>
        </ap:Topic>`);

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const note = findByText(mindmap, 'Plain').findFeatureByType('note')[0] as NoteModel;
    expect(note.getText()).toBe('Only a preview');
    expect(note.getContentType()).not.toBe(ContentType.HTML);
  });
});

describe('MindManagerImporter floating topics and priorities', () => {
  test('imports the floating (callout) topics of any topic, not only the central one', async () => {
    const mindManager = schemaMap(`
        <ap:Topic OId="a">
          <ap:SubTopics><ap:Topic OId="a1"><ap:Text PlainText="Sub"/></ap:Topic></ap:SubTopics>
          <ap:FloatingTopics>
            <ap:Topic OId="c"><ap:Text PlainText="Callout"/></ap:Topic>
          </ap:FloatingTopics>
          <ap:Text PlainText="Parent"/>
        </ap:Topic>`);

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const callout = findByText(mindmap, 'Callout');
    expect(findByText(mindmap, 'Parent').getChildren()).toContain(callout);
    expect(
      findByText(mindmap, 'Parent')
        .getChildren()
        .map((c) => c.getText()),
    ).toEqual(['Sub', 'Callout']);
  });

  test('maps each task priority to its own emoji', async () => {
    const topics = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      .map(
        (prio) =>
          `<ap:Topic OId="p${prio}"><ap:Text PlainText="P${prio}"/><ap:Task TaskPriority="urn:mindjet:Prio${prio}"/></ap:Topic>`,
      )
      .join('');

    const mindmap = loadMindmap(await new MindManagerImporter(schemaMap(topics)).import('test'));

    const emojis = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
      (prio) => iconsOf(findByText(mindmap, `P${prio}`))[0],
    );
    expect(emojis).toEqual(['🔴', '🟡', '🟢', '🔵', '🟣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']);
  });
});

describe('MindManagerImporter relationship line style', () => {
  const relationship = (oid: string, from: string, to: string, style = ''): string => `
    <ap:Relationship OId="${oid}">
      <ap:ConnectionGroup Index="0"><ap:Connection><ap:ObjectReference OIdRef="${from}"/></ap:Connection></ap:ConnectionGroup>
      <ap:ConnectionGroup Index="1"><ap:Connection><ap:ObjectReference OIdRef="${to}"/></ap:Connection></ap:ConnectionGroup>
      ${style}
    </ap:Relationship>`;
  const topics = `<ap:Topic OId="a"><ap:Text PlainText="A"/></ap:Topic><ap:Topic OId="b"><ap:Text PlainText="B"/></ap:Topic>`;

  test('reads the LineDashStyle of the LineStyle element', async () => {
    const mindManager = schemaMap(
      topics,
      `<ap:Relationships>
        ${relationship('r1', 'a', 'b', '<ap:LineStyle LineDashStyle="urn:mindjet:Solid" LineWidth="1.5"/>')}
        ${relationship('r2', 'a', 'b', '<ap:LineStyle LineDashStyle="urn:mindjet:RoundDot"/>')}
        ${relationship('r3', 'a', 'b', '<ap:LineStyle LineDashStyle="urn:mindjet:LongDashDot"/>')}
      </ap:Relationships>`,
    );

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    expect(mindmap.getRelationships().map((r) => r.getStrokeStyle())).toEqual([
      StrokeStyle.SOLID,
      StrokeStyle.DOTTED,
      StrokeStyle.DASHED,
    ]);
  });

  test('uses the relationship defaults of the document when the relationship has no style', async () => {
    const mindManager = schemaMap(
      topics,
      `<ap:Relationships>${relationship('r1', 'a', 'b')}</ap:Relationships>
      <ap:StyleGroup>
        <ap:RelationshipDefaultsGroup>
          <ap:DefaultLineStyle LineDashStyle="urn:mindjet:Solid" LineWidth="1.5"/>
        </ap:RelationshipDefaultsGroup>
      </ap:StyleGroup>`,
    );

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    expect(mindmap.getRelationships().map((r) => r.getStrokeStyle())).toEqual([StrokeStyle.SOLID]);
  });

  test('falls back to dashed, the MindManager default, without any style', async () => {
    const mindManager = schemaMap(
      topics,
      `<ap:Relationships>${relationship('r1', 'a', 'b')}</ap:Relationships>`,
    );

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    expect(mindmap.getRelationships().map((r) => r.getStrokeStyle())).toEqual([StrokeStyle.DASHED]);
  });
});
