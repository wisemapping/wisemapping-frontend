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
import FeatureModelFactory from '../../../src/components/model/FeatureModelFactory';
import XMLSerializerTango from '../../../src/components/persistence/XMLSerializerTango';
import XMLSerializerBeta from '../../../src/components/persistence/XMLSerializerBeta';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';

const parse = (xml: string): Document => new DOMParser().parseFromString(xml, 'text/xml');

// Loads a document the way PersistenceManager.loadFromDom does: serializer picked by version.
const load = (xml: string): Mindmap => {
  const dom = parse(xml);
  return XMLSerializerFactory.createFromDocument(dom).loadFromDom(dom, 'map');
};

const toXmlString = (mindmap: Mindmap): string =>
  new XMLSerializer().serializeToString(new XMLSerializerTango().toXML(mindmap));

const roundTrip = (mindmap: Mindmap): Mindmap =>
  new XMLSerializerTango().loadFromDom(parse(toXmlString(mindmap)), 'map');

const buildMap = (): { mindmap: Mindmap; child: NodeModel } => {
  const mindmap = new Mindmap('map');
  const central = mindmap.createNode('CentralTopic', 1);
  central.setText('Central');
  mindmap.addBranch(central);

  const child = mindmap.createNode('MainTopic', 2);
  child.setText('Child');
  child.setOrder(0);
  child.setPosition(100, 0);
  child.connectTo(central);
  return { mindmap, child };
};

const node = (mindmap: Mindmap, id: number): NodeModel => {
  const result = mindmap.findNodeById(id);
  if (!result) throw new Error(`node ${id} not found`);
  return result;
};

const noteText = (topic: NodeModel): string => {
  const note = topic.findFeatureByType('note')[0];
  return note.getText();
};

describe('note text encoding (F-UNESCAPE)', () => {
  test.each(['50%25 off', '100%20', 'a%u00e9b', 'plain'])(
    'keeps a single line note "%s" through a Tango round trip',
    (text) => {
      const { mindmap, child } = buildMap();
      child.addFeature(FeatureModelFactory.createModel('note', { text }));

      const xml = toXmlString(mindmap);
      // Tango writes note text as CDATA, never as an escape()-encoded attribute.
      expect(xml).toContain(`<note><![CDATA[${text}]]></note>`);
      expect(noteText(node(roundTrip(mindmap), 2))).toBe(text);
    },
  );

  test('still decodes the escape()-encoded note attribute of legacy pela maps', () => {
    const mindmap = load(
      '<map version="pela"><topic central="true" id="1" text="c">' +
        '<topic id="2" position="200,0" order="0" text="a">' +
        '<note text="HR%20Vision%3A%20100%25%0Aok%u2019s"/></topic></topic></map>',
    );
    expect(noteText(node(mindmap, 2))).toBe('HR Vision: 100%\nok’s');
  });
});

describe('pela maps without positions (B-PELA)', () => {
  test('loads a pela map whose topics have no position', () => {
    const mindmap = load(
      '<map version="pela"><topic central="true" id="1" text="c">' +
        '<topic id="2" text="a"><topic id="4" text="a1"/></topic>' +
        '<topic id="3" text="b"/></topic></map>',
    );

    const first = node(mindmap, 2);
    const second = node(mindmap, 3);
    const grandChild = node(mindmap, 4);
    expect(first.getPosition()).toEqual({ x: 0, y: 0 });
    expect(second.getPosition()).toEqual({ x: 0, y: 0 });
    expect(grandChild.getPosition()).toEqual({ x: 30, y: 0 });
    // Both missing positions count as right side: even orders.
    expect([first.getOrder(), second.getOrder()].sort()).toEqual([0, 2]);
  });

  test('keeps the existing positions and left/right ordering of pela maps', () => {
    const mindmap = load(
      '<map version="pela"><topic central="true" id="1" text="c">' +
        '<topic id="2" position="-200,0" order="0" text="left"><topic id="4" text="l1"/></topic>' +
        '<topic id="3" position="200,0" order="1" text="right"><topic id="5" text="r1"/>' +
        '</topic></topic></map>',
    );
    expect(node(mindmap, 2).getOrder()).toBe(1);
    expect(node(mindmap, 3).getOrder()).toBe(0);
    // A child without position goes 30px further from the centre than its parent, on its side:
    // -200 - 30 on the left, as +30 on the right (BL5-06; it was -170, toward the centre).
    expect(node(mindmap, 4).getPosition()).toEqual({ x: -230, y: 0 });
    expect(node(mindmap, 5).getPosition()).toEqual({ x: 230, y: 0 });
  });
});

describe('beta maps (B-BETA)', () => {
  test('reports an empty map document instead of crashing while building the message', () => {
    const dom = parse('<map/>');
    expect(() => new XMLSerializerBeta().loadFromDom(dom, 'map')).not.toThrow();
  });

  test('does not serialize the whole document when loading a valid map', () => {
    const spy = jest.spyOn(XMLSerializer.prototype, 'serializeToString');
    new XMLSerializerBeta().loadFromDom(
      parse('<map><topic central="true" text="c"/></map>'),
      'map',
    );
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test('still rejects a document that is not a map', () => {
    expect(() => new XMLSerializerBeta().loadFromDom(parse('<html/>'), 'map')).toThrow(
      /not to be a map/,
    );
  });

  test('loads the icons of a beta map', () => {
    const mindmap = load(
      '<map><topic central="true" text="c"><icon id="face_plain"/><icon id="unknown_icon"/>' +
        '<link url="http://example.com"/><note text="hello"/></topic></map>',
    );
    const central = mindmap.getBranches()[0];
    const types = central.getFeatures().map((f) => f.getType());
    expect(types).toEqual(['eicon', 'icon', 'link', 'note']);
    expect(central.getFeatures()[0].getAttribute('id')).toBe('😐');
    expect(central.getFeatures()[1].getAttribute('id')).toBe('unknown_icon');
  });

  test('loads the numeric positions of a beta map', () => {
    const mindmap = load(
      '<map><topic central="true" text="c"><topic position="-120,40" text="a"/></topic></map>',
    );
    const child = mindmap.getBranches()[0].getChildren()[0];
    expect(child.getPosition()).toEqual({ x: -120, y: 40 });
  });
});

describe('non finite positions and image sizes (B-NANPOS)', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('ignores a NaN position and keeps the previous one', () => {
    const { child } = buildMap();
    child.setPosition(NaN, NaN);
    expect(child.getPosition()).toEqual({ x: 100, y: 0 });

    child.setPosition(Infinity, 5);
    expect(child.getPosition()).toEqual({ x: 100, y: 0 });
  });

  test('getPosition does not throw on a corrupted stored value', () => {
    const { child } = buildMap();
    child.putProperty('position', { x: NaN, y: NaN });
    expect(() => child.getPosition()).not.toThrow();
    expect(child.getPosition()).toBeUndefined();
  });

  test('ignores a NaN image size and reports a corrupted one as missing', () => {
    const { child } = buildMap();
    child.setImageSize(80, 40);
    child.setImageSize(NaN, 40);
    expect(child.getImageSize()).toEqual({ width: 80, height: 40 });

    child.putProperty('imageSize', { width: NaN, height: NaN });
    expect(() => child.getImageSize()).not.toThrow();
    expect(child.getImageSize()).toBeUndefined();
  });

  test('does not write a NaN position', () => {
    const { mindmap, child } = buildMap();
    child.putProperty('position', { x: NaN, y: NaN });
    expect(toXmlString(mindmap)).not.toContain('NaN');
  });

  test('treats a stored NaN position as missing when loading', () => {
    const mindmap = load(
      '<map version="tango"><topic central="true" id="1" text="c">' +
        '<topic id="2" position="NaN,NaN" order="0" text="a">' +
        '<topic id="3" position="NaN,NaN" order="0" text="b"/></topic>' +
        '<topic id="4" position="50,60" order="1" text="c"><topic id="5" order="0" text="d"/>' +
        '</topic></topic></map>',
    );
    const child = node(mindmap, 2);
    expect(() => child.getPosition()).not.toThrow();
    // Tango requires a position: a missing one falls back to the parent position.
    expect(child.getPosition()).toEqual({ x: 0, y: 0 });
    expect(node(mindmap, 3).getPosition()).toEqual({ x: 0, y: 0 });
    expect(node(mindmap, 5).getPosition()).toEqual({ x: 50, y: 60 });
    // And the map can be saved and loaded again.
    expect(node(roundTrip(mindmap), 2).getText()).toBe('a');
  });

  test('ignores a non numeric image size when loading', () => {
    const mindmap = load(
      '<map version="tango"><topic central="true" id="1" text="c">' +
        '<topic id="2" position="10,10" order="0" shape="image" image="NaN,NaN:http://x/y.png"/>' +
        '</topic></map>',
    );
    const child = node(mindmap, 2);
    expect(() => child.getImageSize()).not.toThrow();
    expect(child.getImageSize()).toBeUndefined();
    expect(child.getImageUrl()).toBe('http://x/y.png');
  });
});
