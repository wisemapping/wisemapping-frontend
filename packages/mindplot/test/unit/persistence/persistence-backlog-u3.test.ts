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
import FeatureType from '../../../src/components/model/FeatureType';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import { LineType } from '../../../src/components/ConnectionLine';

const parse = (xml: string): Document => new DOMParser().parseFromString(xml, 'text/xml');

// Loads a document the way PersistenceManager.loadFromDom does: serializer picked by version.
const load = (xml: string): Mindmap => {
  const dom = parse(xml);
  return XMLSerializerFactory.createFromDocument(dom).loadFromDom(dom, 'map');
};

const node = (mindmap: Mindmap, id: number): NodeModel => mindmap.findNodeById(id) as NodeModel;

// A tango map with a single child topic carrying the given attributes.
const tangoTopic = (attributes: string): NodeModel =>
  node(
    load(
      '<map version="tango"><topic central="true" id="1" text="c">' +
        `<topic id="2" position="200,0" order="0" text="t" ${attributes}/></topic></map>`,
    ),
    2,
  );

// A beta map with a single child topic carrying the given attributes.
const betaTopic = (attributes: string): NodeModel =>
  load(
    `<map><topic central="true" text="c"><topic position="200,0" text="t" ${attributes}/>` +
      '</topic></map>',
  )
    .getBranches()[0]
    .getChildren()[0];

let warn: jest.SpyInstance;

beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('topic attributes validation (BL4-18)', () => {
  test('tango ignores an unknown font weight, font style, shape and connection style', () => {
    const topic = tangoTopic(
      'fontStyle="Arial;10;#000000;heavy;slanted;" shape="hexagon" connStyle="42"',
    );
    expect(topic.getFontWeight()).toBeUndefined();
    expect(topic.getFontStyle()).toBeUndefined();
    expect(topic.getShapeType()).toBeUndefined();
    expect(topic.getConnectionStyle()).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(4);
  });

  test('tango ignores a non numeric font size (BL5-04)', () => {
    expect(tangoTopic('fontStyle="Arial;big;#000000;;;"').getFontSize()).toBeUndefined();
    expect(tangoTopic('fontStyle="Arial;12;#000000;;;"').getFontSize()).toBe(12);
  });

  test('tango ignores a non numeric connection style', () => {
    expect(tangoTopic('connStyle="curved"').getConnectionStyle()).toBeUndefined();
    expect(tangoTopic('connStyle="-1"').getConnectionStyle()).toBeUndefined();
  });

  test('tango keeps the known values', () => {
    ['bold', 'normal', '600'].forEach((weight) => {
      expect(tangoTopic(`fontStyle=";;;${weight};"`).getFontWeight()).toBe(weight);
    });
    ['italic', 'normal'].forEach((style) => {
      expect(tangoTopic(`fontStyle=";;;;${style};"`).getFontStyle()).toBe(style);
    });
    ['rectangle', 'rounded rectangle', 'elipse', 'line', 'none', 'image'].forEach((shape) => {
      expect(tangoTopic(`shape="${shape}"`).getShapeType()).toBe(shape);
    });
    // Legacy typo, written by old versions.
    expect(tangoTopic('shape="rectagle"').getShapeType()).toBe('rectangle');
    Object.values(LineType)
      .filter((value): value is number => typeof value === 'number')
      .forEach((lineType) => {
        expect(tangoTopic(`connStyle="${lineType}"`).getConnectionStyle()).toBe(lineType);
      });
    expect(warn).not.toHaveBeenCalled();
  });

  test('tango still loads the image of an image shaped topic', () => {
    const topic = tangoTopic('shape="image" image="80,40:http://example.com/a.png"');
    expect(topic.getShapeType()).toBe('image');
    expect(topic.getImageUrl()).toBe('http://example.com/a.png');
  });

  test('beta ignores an unknown font weight, font style and shape', () => {
    const topic = betaTopic('fontStyle="Arial;10;#000000;heavy;slanted;" shape="hexagon"');
    expect(topic.getFontWeight()).toBeUndefined();
    expect(topic.getFontStyle()).toBeUndefined();
    expect(topic.getShapeType()).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(3);
  });

  test('beta keeps the known values', () => {
    const topic = betaTopic('fontStyle="Arial;10;#000000;bold;italic;" shape="elipse"');
    expect(topic.getFontWeight()).toBe('bold');
    expect(topic.getFontStyle()).toBe('italic');
    expect(topic.getShapeType()).toBe('elipse');
    expect(betaTopic('shape="rectagle"').getShapeType()).toBe('rectangle');
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('beta topics without position (BL4-19, BL4-21)', () => {
  test('gives a position to a top level topic that is not the central one', () => {
    const mindmap = load(
      '<map><topic central="true" text="c"/>' +
        '<topic text="floating"><topic text="child"/></topic>' +
        '<topic text="other"/></map>',
    );
    const [central, floating, other] = mindmap.getBranches();
    expect(floating.hasPosition()).toBe(true);
    expect(other.hasPosition()).toBe(true);
    // Not on top of the central topic, nor of each other.
    expect(floating.getPosition()).not.toEqual(central.getPosition());
    expect(other.getPosition()).not.toEqual(floating.getPosition());
    expect(floating.getChildren()[0].hasPosition()).toBe(true);
  });

  test('keeps the position of a top level topic that has one', () => {
    const mindmap = load(
      '<map><topic central="true" text="c"/><topic position="300,-80" text="floating"/></map>',
    );
    expect(mindmap.getBranches()[1].getPosition()).toEqual({ x: 300, y: -80 });
  });

  test('places the children of a topic at x 0 on the right, as the tango migrator does', () => {
    const mindmap = load(
      '<map><topic central="true" text="c"><topic text="a"><topic text="a1"/></topic>' +
        '<topic position="0,50" text="b"><topic text="b1"/></topic></topic></map>',
    );
    const [first, second] = mindmap.getBranches()[0].getChildren();
    // The central topic is at x 0: its children without position go to the right.
    expect(first.getPositionOrThrow().x).toBeGreaterThan(0);
    expect(first.getChildren()[0].getPositionOrThrow().x).toBeGreaterThan(0);
    expect(second.getChildren()[0].getPositionOrThrow().x).toBeGreaterThan(0);
    // Right side topics get even orders.
    expect(first.getOrder()! % 2).toBe(0);
  });

  test('still places the children of a left topic on the left', () => {
    const mindmap = load(
      '<map><topic central="true" text="c"><topic position="-200,0" text="a">' +
        '<topic text="a1"/></topic></topic></map>',
    );
    const child = mindmap.getBranches()[0].getChildren()[0].getChildren()[0];
    expect(child.getPositionOrThrow().x).toBeLessThan(-200);
  });
});

describe('feature models (BL4-20)', () => {
  test('do not get a dynamic is<Type>Model method', () => {
    const attributes: Record<FeatureType, Record<string, string>> = {
      note: { text: 'n' },
      link: { url: 'http://example.com' },
      icon: { id: 'face_plain' },
      eicon: { id: '😐' },
    };
    (Object.keys(attributes) as FeatureType[]).forEach((type) => {
      const model = FeatureModelFactory.createModel(type, attributes[type]);
      expect(Object.keys(model).filter((key) => /^is.*Model$/.test(key))).toEqual([]);
    });
  });
});
