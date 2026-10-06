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

import { describe, expect, jest, test } from '@jest/globals';
import { strToU8, zipSync } from 'fflate';
import MindManagerImporter from '../../../src/components/import/MindManagerImporter';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';
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

    const central = mindmap.getCentralTopic()!;
    expect(central.getText()).toBe('Central');
    expect(central.getChildren().map((c) => c.getText())).toEqual(['Child A', 'Child B']);

    const childA = findByText(mindmap, 'Child A');
    expect(childA.getChildren().map((c) => c.getText())).toEqual(['Grandchild']);
    expect(childA.findFeatureByType('note')[0].getText()).toBe('Note of A');
    expect(childA.findFeatureByType('link')[0].getUrl()).toBe('https://example.com');

    const relationships = mindmap.getRelationships();
    expect(relationships).toHaveLength(1);
    expect(relationships[0].getFromNode()).toBe(childA.getId());
    expect(relationships[0].getToNode()).toBe(findByText(mindmap, 'Child B').getId());
  });

  test('still imports a plain XML file', async () => {
    const importer = TextImporterFactory.create('mmap', DOCUMENT_XML);

    const mindmap = loadMindmap(await importer.import('test', ''));

    expect(mindmap.getCentralTopic()!.getChildren()).toHaveLength(2);
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
    expect(icons[0].getIconType()).toBe('🅰️');
  });
});

const iconsOf = (node: NodeModel): string[] =>
  node.findFeatureByType('eicon').map((icon) => icon.getIconType());

describe('MindManagerImporter unknown icons', () => {
  test('skips an icon without an emoji and logs it, instead of importing a light bulb', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const mindManager = `<ap:Map xmlns:ap="http://schemas.mindjet.com/MindManager/Application/2003">
      <ap:OneTopic><ap:Topic OId="t1"><ap:Text PlainText="Central"/>
        <ap:IconsGroup><ap:Icons>
          <ap:Icon IconType="urn:mindjet:NoSuchIcon"/>
          <ap:Icon IconType="urn:mindjet:Rocket"/>
        </ap:Icons></ap:IconsGroup>
      </ap:Topic></ap:OneTopic>
    </ap:Map>`;

    try {
      const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

      expect(iconsOf(mindmap.getCentralTopic() as NodeModel)).toEqual(['🚀']);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('NoSuchIcon'));
    } finally {
      warn.mockRestore();
    }
  });

  test('logs the custom icons, which have no emoji, instead of dropping them silently', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const mindManager = `<ap:Map xmlns:ap="http://schemas.mindjet.com/MindManager/Application/2003" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <ap:OneTopic><ap:Topic OId="t1"><ap:Text PlainText="Central"/>
        <ap:IconsGroup>
          <ap:Icons>
            <ap:Icon xsi:type="ap:CustomIcon" IconSignature="AAECAwQFBgcICQoLDA0ODw=="/>
            <ap:Icon xsi:type="ap:StockIcon" IconType="urn:mindjet:Check"/>
          </ap:Icons>
          <ap:CustomIconImageData IconSignature="AAECAwQFBgcICQoLDA0ODw=="/>
        </ap:IconsGroup>
      </ap:Topic></ap:OneTopic>
    </ap:Map>`;

    try {
      const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

      expect(iconsOf(mindmap.getCentralTopic() as NodeModel)).toEqual(['✅']);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('custom icon'));
    } finally {
      warn.mockRestore();
    }
  });

  test('matches the icon ids ignoring case', async () => {
    const mindManager = `<?xml version="1.0" encoding="UTF-8"?>
<Map xmlns="http://www.mindjet.com/MindManager/MindMapXML/1.0">
  <Topic ID="1" Text="Root">
    <Topic ID="2" Text="Lower"><Icon Name="calendar"/></Topic>
    <Topic ID="3" Text="Exact"><Icon Name="phone"/></Topic>
  </Topic>
</Map>`;

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    expect(iconsOf(findByText(mindmap, 'Lower'))).toEqual(['📅']);
    expect(iconsOf(findByText(mindmap, 'Exact'))).toEqual(['📱']);
  });
});

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
    expect(central.findFeatureByType('note').at(0)?.getText()).toBe('Root note');
    expect(central.findFeatureByType('link').at(0)?.getUrl()).toBe('https://example.com/root');
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

describe('MindManagerImporter hyperlinks', () => {
  test('skips the links to a topic of the map, which can not be opened as a URL', async () => {
    const mindManager = schemaMap(`
        <ap:Topic OId="a"><ap:Text PlainText="Web"/>
          <ap:Hyperlink Url="https://www.microsoft.com" Title="Microsoft" Absolute="false"/>
        </ap:Topic>
        <ap:Topic OId="b"><ap:Text PlainText="Internal"/>
          <ap:Hyperlink Url="#xpointer(/descendant-or-self::ap:Topic[@OId='a'])" Absolute="false"/>
        </ap:Topic>`);

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    expect(findByText(mindmap, 'Web').findFeatureByType('link')[0].getUrl()).toBe(
      'https://www.microsoft.com',
    );
    expect(findByText(mindmap, 'Internal').findFeatureByType('link')).toEqual([]);
  });
});

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

    const note = findByText(mindmap, 'Rich').findFeatureByType('note')[0];
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

    const note = findByText(mindmap, 'Plain').findFeatureByType('note')[0];
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

  test('a callout above its topic (negative Offset CY) comes before the subtopics', async () => {
    const mindManager = schemaMap(`
        <ap:Topic OId="a">
          <ap:SubTopics>
            <ap:Topic OId="a1"><ap:Text PlainText="Sub 1"/></ap:Topic>
            <ap:Topic OId="a2"><ap:Text PlainText="Sub 2"/></ap:Topic>
          </ap:SubTopics>
          <ap:FloatingTopics>
            <ap:Topic OId="c1"><ap:Text PlainText="Below"/><ap:Offset CX="20." CY="15."/></ap:Topic>
            <ap:Topic OId="c2"><ap:Text PlainText="Above"/><ap:Offset CX="10." CY="-20."/></ap:Topic>
            <ap:Topic OId="c3"><ap:Text PlainText="No offset"/></ap:Topic>
          </ap:FloatingTopics>
          <ap:Text PlainText="Parent"/>
        </ap:Topic>`);

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const children = findByText(mindmap, 'Parent').getChildren();
    expect(children.map((c) => c.getText())).toEqual([
      'Above',
      'Sub 1',
      'Sub 2',
      'Below',
      'No offset',
    ]);
    expect(children.map((c) => c.getOrder())).toEqual([0, 1, 2, 3, 4]);
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
  const topics =
    '<ap:Topic OId="a"><ap:Text PlainText="A"/></ap:Topic><ap:Topic OId="b"><ap:Text PlainText="B"/></ap:Topic>';

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

describe('MindManagerImporter relationship color and arrows', () => {
  const topics =
    '<ap:Topic OId="a"><ap:Text PlainText="A"/></ap:Topic><ap:Topic OId="b"><ap:Text PlainText="B"/></ap:Topic>';
  const end = (index: number, oid: string, shape?: string): string => `
      <ap:ConnectionGroup Index="${index}">
        <ap:Connection><ap:ObjectReference OIdRef="${oid}"/></ap:Connection>
        ${shape ? `<ap:ConnectionStyle ConnectionShape="urn:mindjet:${shape}"/>` : ''}
      </ap:ConnectionGroup>`;
  const defaults = `<ap:StyleGroup>
      <ap:RelationshipDefaultsGroup>
        <ap:DefaultColor FillColor="00000000" LineColor="ffe0666e"/>
        <ap:DefaultConnectionStyle ConnectionShape="urn:mindjet:Arrow" Index="0"/>
        <ap:DefaultConnectionStyle ConnectionShape="urn:mindjet:NoArrow" Index="1"/>
      </ap:RelationshipDefaultsGroup>
    </ap:StyleGroup>`;

  test('reads the LineColor and the ConnectionShape of each end of the relationship', async () => {
    const mindManager = schemaMap(
      topics,
      `<ap:Relationships>
        <ap:Relationship OId="r1">${end(0, 'a', 'OpenArrow')}${end(1, 'b', 'NoArrow')}
          <ap:Color LineColor="ff3170af"/>
        </ap:Relationship>
      </ap:Relationships>`,
    );

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const [relationship] = mindmap.getRelationships();
    expect(relationship.getStrokeColor()).toBe('#3170af');
    expect(relationship.getStartArrow()).toBe(true);
    expect(relationship.getEndArrow()).toBe(false);
  });

  test('uses the RelationshipDefaultsGroup when the relationship has no color or arrows', async () => {
    const mindManager = schemaMap(
      topics,
      `<ap:Relationships>
        <ap:Relationship OId="r1">${end(0, 'a')}${end(1, 'b')}</ap:Relationship>
      </ap:Relationships>${defaults}`,
    );

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const [relationship] = mindmap.getRelationships();
    expect(relationship.getStrokeColor()).toBe('#e0666e');
    expect(relationship.getStartArrow()).toBe(true);
    expect(relationship.getEndArrow()).toBe(false);
  });

  test('without any style, an arrow at the end and the color of the theme', async () => {
    const mindManager = schemaMap(
      topics,
      `<ap:Relationships>
        <ap:Relationship OId="r1">${end(0, 'a')}${end(1, 'b')}</ap:Relationship>
      </ap:Relationships>`,
    );

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const [relationship] = mindmap.getRelationships();
    expect(relationship.getStrokeColor()).toBeUndefined();
    expect(relationship.getStartArrow()).toBe(false);
    expect(relationship.getEndArrow()).toBe(true);
  });
});

describe('MindManagerImporter relationship labels', () => {
  test('imports the label of a relationship as a floating topic between its ends', async () => {
    const mindManager = `<ap:Map xmlns:ap="http://schemas.mindjet.com/MindManager/Application/2003">
      <ap:OneTopic><ap:Topic OId="root"><ap:Text PlainText="Central"/>
        <ap:FloatingTopics>
          <ap:Topic OId="f1"><ap:Text PlainText="Start"/><ap:Offset CX="100." CY="0."/></ap:Topic>
          <ap:Topic OId="f2"><ap:Text PlainText="End"/><ap:Offset CX="100." CY="50."/></ap:Topic>
        </ap:FloatingTopics>
      </ap:Topic></ap:OneTopic>
      <ap:Relationships>
        <ap:Relationship OId="r1">
          <ap:ConnectionGroup Index="0"><ap:Connection><ap:ObjectReference OIdRef="f1"/></ap:Connection></ap:ConnectionGroup>
          <ap:ConnectionGroup Index="1"><ap:Connection><ap:ObjectReference OIdRef="f2"/></ap:Connection></ap:ConnectionGroup>
          <ap:FloatingTopics>
            <ap:Topic OId="l1"><ap:Text PlainText="Label"/><ap:Offset CX="10." CY="0."/>
              <ap:Hyperlink Url="https://example.com/label"/>
            </ap:Topic>
          </ap:FloatingTopics>
        </ap:Relationship>
      </ap:Relationships>
    </ap:Map>`;

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const label = findByText(mindmap, 'Label');
    expect(mindmap.getBranches()).toContain(label);
    expect(label.getParent()).toBeFalsy();
    expect(label.findFeatureByType('link')[0].getUrl()).toBe('https://example.com/label');
    // The middle of Start (378, 0) and End (378, 189), moved by the Offset of the label (38, 0)
    expect(label.getPosition()).toEqual({ x: 416, y: 95 });
    // MindManager draws relationship labels as plain text.
    expect(label.getShapeType()).toBe('none');
    expect(mindmap.getRelationships()).toHaveLength(1);
  });
});

describe('MindManagerImporter default topic texts', () => {
  test('takes the text of a topic without ap:Text from the StyleGroup of its level', async () => {
    const level = (n: number, text: string) =>
      `<ap:RootSubTopicDefaultsGroup Level="${n}"><ap:DefaultText PlainText="${text}"/></ap:RootSubTopicDefaultsGroup>`;
    const xml = `<ap:Map xmlns:ap="http://schemas.mindjet.com/MindManager/Application/2003">
      <ap:OneTopic><ap:Topic OId="t1"><ap:SubTopics>
        <ap:Topic OId="t2"><ap:SubTopics>
          <ap:Topic OId="t3"><ap:SubTopics><ap:Topic OId="t4"/></ap:SubTopics></ap:Topic>
        </ap:SubTopics></ap:Topic>
        <ap:Topic OId="t5"><ap:Text PlainText="Own text"/></ap:Topic>
      </ap:SubTopics></ap:Topic></ap:OneTopic>
      <ap:StyleGroup>
        <ap:RootTopicDefaultsGroup><ap:DefaultText PlainText="Central Topic"/></ap:RootTopicDefaultsGroup>
        ${level(1, 'Subtopic')}${level(0, 'Main Topic')}
      </ap:StyleGroup>
    </ap:Map>`;

    const mindmap = loadMindmap(await new MindManagerImporter(xml).import('test', ''));

    const central = mindmap.getCentralTopic()!;
    expect(central.getText()).toBe('Central Topic');
    const [main, own] = central.getChildren();
    expect([main.getText(), own.getText()]).toEqual(['Main Topic', 'Own text']);
    const sub = main.getChildren()[0];
    expect(sub.getText()).toBe('Subtopic');
    // Below the deepest level of the StyleGroup, the deepest one applies.
    expect(sub.getChildren()[0].getText()).toBe('Subtopic');
  });
});

describe('MindManagerImporter topic shapes', () => {
  const styleGroup = `<ap:StyleGroup>
      <ap:RootTopicDefaultsGroup>
        <ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:Hexagon"/>
        <ap:DefaultLabelFloatingTopicShape LabelFloatingTopicShape="urn:mindjet:None"/>
        <ap:DefaultCalloutFloatingTopicShape CalloutFloatingTopicShape="urn:mindjet:None"/>
      </ap:RootTopicDefaultsGroup>
      <ap:LabelTopicDefaultsGroup>
        <ap:DefaultLabelFloatingTopicShape LabelFloatingTopicShape="urn:mindjet:Capsule"/>
      </ap:LabelTopicDefaultsGroup>
      <ap:CalloutTopicDefaultsGroup>
        <ap:DefaultCalloutFloatingTopicShape CalloutFloatingTopicShape="urn:mindjet:RectangleBalloon"/>
      </ap:CalloutTopicDefaultsGroup>
      <ap:RootSubTopicDefaultsGroup Level="0"><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:RoundedRectangle"/></ap:RootSubTopicDefaultsGroup>
      <ap:RootSubTopicDefaultsGroup Level="1"><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:Rectangle"/></ap:RootSubTopicDefaultsGroup>
      <ap:RootSubTopicDefaultsGroup Level="2"><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:Line"/></ap:RootSubTopicDefaultsGroup>
    </ap:StyleGroup>`;
  const topics = `
    <ap:Topic OId="main"><ap:Text PlainText="Main"/>
      <ap:SubTopics>
        <ap:Topic OId="sub"><ap:Text PlainText="Sub"/>
          <ap:SubTopics><ap:Topic OId="deep"><ap:Text PlainText="Deep"/></ap:Topic></ap:SubTopics>
        </ap:Topic>
        <ap:Topic OId="own"><ap:Text PlainText="Own"/><ap:SubTopicShape SubTopicShape="urn:mindjet:Oval"/></ap:Topic>
      </ap:SubTopics>
      <ap:FloatingTopics><ap:Topic OId="callout"><ap:Text PlainText="Callout"/></ap:Topic></ap:FloatingTopics>
    </ap:Topic>`;
  const withFloating = (rest: string): string =>
    schemaMap(topics, rest).replace(
      '<ap:Text PlainText="Central"/>',
      '<ap:Text PlainText="Central"/><ap:FloatingTopics><ap:Topic OId="label"><ap:Text PlainText="Label"/></ap:Topic></ap:FloatingTopics>',
    );

  test('each level takes the DefaultSubTopicShape of the StyleGroup, unless it has its own', async () => {
    const mindmap = loadMindmap(
      await new MindManagerImporter(withFloating(styleGroup)).import('test'),
    );
    const shape = (text: string) => findByText(mindmap, text).getShapeType();

    expect(shape('Main')).toBe('rounded rectangle');
    expect(shape('Sub')).toBe('rectangle');
    expect(shape('Deep')).toBe('line');
    expect(shape('Own')).toBe('elipse');
    // The floating topics and callouts take the shapes of the Label and CalloutTopicDefaultsGroup,
    // not the ones of the RootTopicDefaultsGroup (as in the real files).
    expect(shape('Label')).toBe('rounded rectangle');
    expect(shape('Callout')).toBe('rectangle');
    // The central topic keeps the shape of the theme.
    expect(mindmap.getCentralTopic()!.getShapeType()).toBeUndefined();
  });

  test('without a StyleGroup, the topics are lines', async () => {
    const mindmap = loadMindmap(await new MindManagerImporter(withFloating('')).import('test'));

    ['Main', 'Sub', 'Deep', 'Label', 'Callout'].forEach((text) =>
      expect(findByText(mindmap, text).getShapeType()).toBe('line'),
    );
    expect(findByText(mindmap, 'Own').getShapeType()).toBe('elipse');
  });
});

describe('MindManagerImporter collapsed topics', () => {
  const view = (collapsed: boolean): string =>
    `<ap:TopicViewGroup ViewIndex="0"><ap:Collapsed Collapsed="${collapsed}"/></ap:TopicViewGroup>`;
  const sub = (oid: string) =>
    `<ap:SubTopics><ap:Topic OId="${oid}"><ap:Text PlainText="${oid}"/></ap:Topic></ap:SubTopics>`;

  test('a collapsed topic with subtopics is imported shrunk', async () => {
    const mindManager = schemaMap(`
        <ap:Topic OId="a">${sub('a1')}${view(true)}<ap:Text PlainText="Collapsed"/></ap:Topic>
        <ap:Topic OId="b">${sub('b1')}${view(false)}<ap:Text PlainText="Expanded"/></ap:Topic>
        <ap:Topic OId="c">${sub('c1')}<ap:Text PlainText="No view"/></ap:Topic>
        <ap:Topic OId="d">${view(true)}<ap:Text PlainText="Leaf"/></ap:Topic>`);

    const xml = await new MindManagerImporter(mindManager).import('test');
    const mindmap = loadMindmap(xml);

    expect(findByText(mindmap, 'Collapsed').areChildrenShrunken()).toBe(true);
    expect(findByText(mindmap, 'Expanded').areChildrenShrunken()).toBe(false);
    expect(findByText(mindmap, 'No view').areChildrenShrunken()).toBe(false);
    // A leaf has nothing to shrink.
    expect(findByText(mindmap, 'Leaf').areChildrenShrunken()).toBe(false);
    expect(xml.match(/shrink="true"/g)).toHaveLength(1);
  });
});

describe('MindManagerImporter growth direction of the main topics', () => {
  const mains = ['M1', 'M2', 'M3', 'M4']
    .map((text) => `<ap:Topic OId="${text}"><ap:Text PlainText="${text}"/></ap:Topic>`)
    .join('');
  const growth = (direction: string): string =>
    `<ap:DefaultSubTopicsShape SubTopicsGrowthDirection="urn:mindjet:${direction}"/>`;
  const styleGroup = (direction: string): string =>
    `<ap:StyleGroup><ap:RootTopicDefaultsGroup>${growth(direction)}</ap:RootTopicDefaultsGroup></ap:StyleGroup>`;
  const sides = (mindmap: Mindmap): number[] =>
    mindmap
      .getCentralTopic()!
      .getChildren()
      .map((node) => Math.sign(node.getPosition()!.x));
  const orders = (mindmap: Mindmap): number[] =>
    mindmap
      .getCentralTopic()!
      .getChildren()
      .map((node) => node.getOrder()!);

  test('Right puts every main topic on the right', async () => {
    const mindmap = loadMindmap(
      await new MindManagerImporter(schemaMap(mains, styleGroup('Right'))).import('test'),
    );

    expect(sides(mindmap)).toEqual([1, 1, 1, 1]);
    expect(orders(mindmap)).toEqual([0, 2, 4, 6]);
  });

  test('Left puts every main topic on the left', async () => {
    const mindmap = loadMindmap(
      await new MindManagerImporter(schemaMap(mains, styleGroup('Left'))).import('test'),
    );

    expect(sides(mindmap)).toEqual([-1, -1, -1, -1]);
    expect(orders(mindmap)).toEqual([1, 3, 5, 7]);
  });

  test('the SubTopicsShape of the central topic overrides the StyleGroup', async () => {
    const xml = schemaMap(mains, styleGroup('LeftAndRight')).replace(
      '<ap:Text PlainText="Central"/>',
      '<ap:Text PlainText="Central"/><ap:SubTopicsShape SubTopicsGrowthDirection="urn:mindjet:Right"/>',
    );

    const mindmap = loadMindmap(await new MindManagerImporter(xml).import('test'));

    expect(sides(mindmap)).toEqual([1, 1, 1, 1]);
  });

  test.each(['LeftAndRight', 'AutomaticHorizontal'])(
    '%s still balances the sides',
    async (direction) => {
      const mindmap = loadMindmap(
        await new MindManagerImporter(schemaMap(mains, styleGroup(direction))).import('test'),
      );
      expect(sides(mindmap)).toEqual([1, -1, 1, -1]);
    },
  );
});

describe('MindManagerImporter default colors of the StyleGroup (BL5-138)', () => {
  const styleGroup = `<ap:StyleGroup>
      <ap:RootTopicDefaultsGroup><ap:DefaultColor FillColor="ff111111" LineColor="ff222222"/></ap:RootTopicDefaultsGroup>
      <ap:RootSubTopicDefaultsGroup Level="0"><ap:DefaultColor FillColor="ffeef4fa" LineColor="ff3170af"/></ap:RootSubTopicDefaultsGroup>
      <ap:RootSubTopicDefaultsGroup Level="1"><ap:DefaultColor FillColor="00000000" LineColor="ff999999"/></ap:RootSubTopicDefaultsGroup>
    </ap:StyleGroup>`;
  const topics = `
    <ap:Topic OId="main"><ap:Text PlainText="Main"/>
      <ap:SubTopics>
        <ap:Topic OId="sub"><ap:Text PlainText="Sub"/></ap:Topic>
        <ap:Topic OId="own"><ap:Text PlainText="Own"/><ap:Color FillColor="ffabe595"/></ap:Topic>
      </ap:SubTopics>
    </ap:Topic>
    <ap:Topic OId="clear"><ap:Text PlainText="Clear"/><ap:Color FillColor="00000000"/></ap:Topic>`;

  test('each topic takes the fill and line colors of its level, unless it has its own', async () => {
    const mindmap = loadMindmap(
      await new MindManagerImporter(schemaMap(topics, styleGroup)).import('test'),
    );
    const colors = (node: NodeModel) => [node.getBackgroundColor(), node.getBorderColor()];

    expect(colors(mindmap.getCentralTopic() as NodeModel)).toEqual(['#111111', '#222222']);
    expect(colors(findByText(mindmap, 'Main'))).toEqual(['#eef4fa', '#3170af']);
    // A transparent fill is no fill.
    expect(colors(findByText(mindmap, 'Sub'))).toEqual([undefined, '#999999']);
    // Its own fill, the line of its level.
    expect(colors(findByText(mindmap, 'Own'))).toEqual(['#abe595', '#999999']);
    // Its own transparent fill is kept.
    expect(colors(findByText(mindmap, 'Clear'))).toEqual([undefined, '#3170af']);
  });

  test('without a StyleGroup, only the own colors are imported', async () => {
    const mindmap = loadMindmap(await new MindManagerImporter(schemaMap(topics)).import('test'));

    expect(findByText(mindmap, 'Main').getBackgroundColor()).toBeUndefined();
    expect(findByText(mindmap, 'Own').getBackgroundColor()).toBe('#abe595');
    expect(findByText(mindmap, 'Own').getBorderColor()).toBe('#abe595');
  });
});

describe('MindManagerImporter task progress (BL5-139)', () => {
  test('imports the TaskPercentage as the closest task progress icon', async () => {
    const percentages = ['0', '25', '50', '75', '100', '60', '90', '150'];
    const mindManager = schemaMap(
      percentages
        .map(
          (percentage) =>
            `<ap:Topic OId="t${percentage}"><ap:Text PlainText="T${percentage}"/><ap:Task TaskPercentage="${percentage}" TaskPriority="urn:mindjet:Prio2"/></ap:Topic>`,
        )
        .join(''),
    );

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    expect(
      percentages.map((percentage) =>
        findByText(mindmap, `T${percentage}`)
          .findFeatureByType('icon')
          .map((icon) => icon.getAttribute('id')),
      ),
    ).toEqual([
      ['task_0'],
      ['task_25'],
      ['task_50'],
      ['task_75'],
      ['task_100'],
      ['task_50'],
      ['task_100'],
      ['task_100'],
    ]);
    // The priority is still imported.
    expect(findByText(mindmap, 'T0').findFeatureByType('eicon')).toHaveLength(1);
  });

  test('a task without a percentage has no progress icon', async () => {
    const mindManager = schemaMap(
      '<ap:Topic OId="t"><ap:Text PlainText="T"/><ap:Task TaskPercentage="" TaskPriority="urn:mindjet:Prio1"/></ap:Topic>',
    );

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    expect(findByText(mindmap, 'T').findFeatureByType('icon')).toEqual([]);
  });
});

describe('MindManagerImporter XHTML note whitespace (BL5-140)', () => {
  test('collapses the source whitespace, keeping the line breaks of the markup', async () => {
    const mindManager = schemaMap(`
        <ap:Topic OId="a">
          <ap:Text PlainText="Spaced"/>
          <ap:NotesGroup>
            <ap:NotesXhtmlData PreviewPlainText="This is a test">
              <html xmlns="http://www.w3.org/1999/xhtml"><p><b>This&#160;</b>


<span>is a</span>


</p>

<p>line<br/>break</p>
<pre>keep
  this</pre>
</html>
            </ap:NotesXhtmlData>
          </ap:NotesGroup>
        </ap:Topic>`);

    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const note = findByText(mindmap, 'Spaced').findFeatureByType('note')[0];
    expect(note.getText()).toBe(
      '<p><b>This&nbsp;</b> <span>is a</span></p><p>line<br>break</p><pre>keep\n  this</pre>',
    );
  });
});
