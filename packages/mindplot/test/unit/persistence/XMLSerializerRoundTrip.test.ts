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
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';
import NoteModel from '../../../src/components/model/NoteModel';
import FeatureModelFactory from '../../../src/components/model/FeatureModelFactory';
import XMLSerializerTango from '../../../src/components/persistence/XMLSerializerTango';
import XMLSerializerBeta from '../../../src/components/persistence/XMLSerializerBeta';

type MapFixture = {
  mindmap: Mindmap;
  central: NodeModel;
  child: NodeModel;
};

const buildMap = (mapId = 'roundtrip'): MapFixture => {
  const mindmap = new Mindmap(mapId);
  const central = mindmap.createNode('CentralTopic', 1);
  central.setText('Central');
  mindmap.addBranch(central);

  const child = mindmap.createNode('MainTopic', 2);
  child.setText('Child');
  child.setOrder(0);
  child.setPosition(100, 0);
  child.connectTo(central);

  return { mindmap, central, child };
};

const toXmlString = (mindmap: Mindmap): string =>
  new XMLSerializer().serializeToString(new XMLSerializerTango().toXML(mindmap));

// Serialize to a string and parse it back, the same way the map travels to and from the server.
const roundTrip = (mindmap: Mindmap): Mindmap => {
  const xml = toXmlString(mindmap);
  const dom = new DOMParser().parseFromString(xml, 'text/xml');
  expect(dom.getElementsByTagName('parsererror')).toHaveLength(0);
  return new XMLSerializerTango().loadFromDom(dom, 'roundtrip');
};

const findChild = (mindmap: Mindmap): NodeModel => mindmap.findNodeById(2) as NodeModel;

const noteText = (topic: NodeModel): string => {
  const note = topic.getFeatures().find((f) => f.getType() === 'note') as NoteModel;
  return note.getText();
};

describe('XMLSerializerTango round trip', () => {
  describe('astral plane characters (D1)', () => {
    const text = 'Hi 😀 𝔸 ok';
    const multiline = 'Line 1 😀\nLine 2 𝔸';

    test('keeps emoji and other astral characters in single line topic text', () => {
      const { mindmap, child } = buildMap();
      child.setText(text);

      expect(findChild(roundTrip(mindmap)).getText()).toBe(text);
    });

    test('keeps emoji and other astral characters in multiline topic text', () => {
      const { mindmap, child } = buildMap();
      child.setText(multiline);

      expect(findChild(roundTrip(mindmap)).getText()).toBe(multiline);
    });

    test('keeps emoji and other astral characters in note text', () => {
      const { mindmap, child } = buildMap();
      child.addFeature(FeatureModelFactory.createModel('note', { text: multiline }));

      expect(noteText(findChild(roundTrip(mindmap)))).toBe(multiline);
    });

    test('keeps emoji and other astral characters in the map name', () => {
      const { mindmap } = buildMap(text);

      const xml = toXmlString(mindmap);
      const dom = new DOMParser().parseFromString(xml, 'text/xml');
      expect(dom.documentElement.getAttribute('name')).toBe(text);
    });

    test('still strips characters that are not valid in XML 1.0', () => {
      const { mindmap, child } = buildMap();
      // NUL, a control char, a lone high surrogate, a lone low surrogate and U+FFFF.
      child.setText('a\u0000b\u0001c\ud800d\udc00e￿\tf');

      expect(findChild(roundTrip(mindmap)).getText()).toBe('abcde\tf');
    });
  });

  describe('CDATA terminator in text (D2)', () => {
    const text = 'if (a[b[0]]>1) {\n  x = "]]>";\n}]]';

    test('serializes and restores topic text that contains "]]>"', () => {
      const { mindmap, child } = buildMap();
      child.setText(text);

      expect(findChild(roundTrip(mindmap)).getText()).toBe(text);
    });

    test('serializes and restores note text that contains "]]>"', () => {
      const { mindmap, child } = buildMap();
      child.addFeature(FeatureModelFactory.createModel('note', { text }));

      expect(noteText(findChild(roundTrip(mindmap)))).toBe(text);
    });

    test('restores text made only of CDATA terminators', () => {
      const { mindmap, child } = buildMap();
      child.setText(']]>\n]]>]]>');

      expect(findChild(roundTrip(mindmap)).getText()).toBe(']]>\n]]>]]>');
    });
  });

  describe('dangling relationships (D6)', () => {
    test('does not persist relationships that point to a node that no longer exists', () => {
      const { mindmap } = buildMap();
      mindmap.addRelationship(mindmap.createRelationship(1, 2));
      mindmap.addRelationship(mindmap.createRelationship(2, 99));
      mindmap.addRelationship(mindmap.createRelationship(99, 1));

      const dom = new XMLSerializerTango().toXML(mindmap);
      const relationships = Array.from(dom.getElementsByTagName('relationship'));

      expect(
        relationships.map(
          (r) => `${r.getAttribute('srcTopicId')}->${r.getAttribute('destTopicId')}`,
        ),
      ).toEqual(['1->2']);
    });

    test('findNodeById returns undefined when the node does not exist', () => {
      const { mindmap } = buildMap();

      expect(mindmap.findNodeById(2)?.getId()).toBe(2);
      expect(mindmap.findNodeById(99)).toBeUndefined();
    });
  });

  describe('shrink attribute (B-SHRINK)', () => {
    const tangoXml = (shrink: string) =>
      '<map name="m" version="tango"><topic central="true" id="1" text="C">' +
      `<topic id="2" order="0" text="A" shrink="${shrink}"><topic id="3" order="0" text="B"/></topic>` +
      '</topic></map>';

    test('writer only emits shrink="true" for collapsed topics with children', () => {
      const { mindmap, central, child } = buildMap();
      const grandChild = mindmap.createNode('MainTopic', 3);
      grandChild.setOrder(0);
      grandChild.setPosition(200, 0);
      grandChild.connectTo(child);
      child.setChildrenShrunken(true);
      central.setChildrenShrunken(true);

      const dom = new XMLSerializerTango().toXML(mindmap);
      const shrinkValues = Array.from(dom.getElementsByTagName('topic'))
        .filter((t) => t.hasAttribute('shrink'))
        .map((t) => `${t.getAttribute('id')}=${t.getAttribute('shrink')}`);
      expect(shrinkValues).toEqual(['2=true']);

      expect(findChild(roundTrip(mindmap)).areChildrenShrunken()).toBe(true);
    });

    test.each([
      ['true', true],
      ['false', false],
      ['', false],
    ])('tango loads shrink="%s" as %s', (shrink, expected) => {
      const dom = new DOMParser().parseFromString(tangoXml(shrink), 'text/xml');
      const mindmap = new XMLSerializerTango().loadFromDom(dom, 'm');

      expect(findChild(mindmap).areChildrenShrunken()).toBe(expected);
    });

    test.each([
      ['true', true],
      ['false', false],
      ['', false],
    ])('beta loads shrink="%s" as %s', (shrink, expected) => {
      const xml =
        '<map name="m"><topic central="true" id="1" text="C">' +
        `<topic id="2" order="0" text="A" shrink="${shrink}"><topic id="3" order="0" text="B"/></topic>` +
        '</topic></map>';
      const dom = new DOMParser().parseFromString(xml, 'text/xml');
      const mindmap = new XMLSerializerBeta().loadFromDom(dom, 'm');
      const topic = mindmap.getCentralTopic().getChildren()[0];

      expect(topic.areChildrenShrunken()).toBe(expected);
    });
  });
});
