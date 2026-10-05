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
import LinkModel from '../../../src/components/model/LinkModel';
import FeatureModel from '../../../src/components/model/FeatureModel';
import FeatureModelFactory from '../../../src/components/model/FeatureModelFactory';
import XMLSerializerBeta from '../../../src/components/persistence/XMLSerializerBeta';
import XMLMindmapSerializer from '../../../src/components/persistence/XMLMindmapSerializer';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import PersistenceManager from '../../../src/components/PersistenceManager';

const parse = (xml: string): Document => new DOMParser().parseFromString(xml, 'text/xml');

// Loads a document the way PersistenceManager.loadFromDom does: serializer picked by version.
const load = (xml: string): Mindmap => {
  const dom = parse(xml);
  return XMLSerializerFactory.createFromDocument(dom).loadFromDom(dom, 'map');
};

const node = (mindmap: Mindmap, id: number): NodeModel => mindmap.findNodeById(id) as NodeModel;

const noteOf = (topic: NodeModel): NoteModel =>
  topic.getFeatures().find((f) => f.getType() === 'note') as NoteModel;

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('map attributes validation (BL-06)', () => {
  test('falls back to the defaults for an unknown theme, layout and background pattern', () => {
    const mindmap = load(
      '<map version="tango" theme="bogus" layout="spiral" backgroundPattern="stripes">' +
        '<topic central="true" id="1" text="c"/></map>',
    );
    expect(mindmap.getTheme()).toBe('classic');
    expect(mindmap.getLayout()).toBe('mindmap');
    expect(mindmap.getCanvasStyle()?.backgroundPattern).toBeUndefined();
  });

  test('keeps known values and still maps dark-prism to prism', () => {
    const mindmap = load(
      '<map version="tango" theme="dark-prism" layout="tree" backgroundPattern="grid">' +
        '<topic central="true" id="1" text="c"/></map>',
    );
    expect(mindmap.getTheme()).toBe('prism');
    expect(mindmap.getLayout()).toBe('tree');
    expect(mindmap.getCanvasStyle()?.backgroundPattern).toBe('grid');
  });
});

describe('beta loader (BL-41, BL-53, BL-73)', () => {
  test('decodes the escape()-encoded notes of beta maps', () => {
    const mindmap = load(
      '<map><topic central="true" text="c">' +
        '<note text="door%20slimme%2C%20meest%20effici%EBnte%0Aweg"/></topic></map>',
    );
    expect(noteOf(mindmap.getBranches()[0]).getText()).toBe('door slimme, meest efficiënte\nweg');
  });

  test('loads the font size of a beta topic as a number', () => {
    const mindmap = load(
      '<map><topic central="true" text="c" fontStyle="Arial;12;#000;bold;"/></map>',
    );
    expect(mindmap.getBranches()[0].getFontSize()).toBe(12);
  });

  test('ignores a non numeric font size', () => {
    const mindmap = load('<map><topic central="true" text="c" fontStyle="Arial;big;;;"/></map>');
    const central = mindmap.getBranches()[0];
    expect(central.getFontSize()).toBeUndefined();
    expect(central.getFontFamily()).toBe('Arial');
  });

  test('skips a link without url instead of failing to load the map', () => {
    const mindmap = load(
      '<map><topic central="true" text="c"><link/><note text="n"/></topic></map>',
    );
    const types = mindmap
      .getBranches()[0]
      .getFeatures()
      .map((f) => f.getType());
    expect(types).toEqual(['note']);
  });
});

describe('beta writer (BL-42)', () => {
  test('is not supported: beta maps are always written as tango', () => {
    const mindmap = new Mindmap('map', 'beta');
    const serializer: XMLMindmapSerializer = new XMLSerializerBeta();
    expect(() => serializer.toXML(mindmap)).toThrow(/not supported/);
  });

  test('a loaded beta map is migrated to tango and saved with its icons and links', () => {
    const mindmap = load(
      '<map><topic central="true" text="c"><icon id="unknown_icon"/>' +
        '<link url="http://example.com"/></topic></map>',
    );
    expect(mindmap.getVersion()).toBe('tango');
    const xml = new XMLSerializer().serializeToString(
      XMLSerializerFactory.createFromMindmap(mindmap).toXML(mindmap),
    );
    expect(xml).toContain('<icon id="unknown_icon"/>');
    expect(xml).toContain('<link url="http://example.com" urlType="url"/>');
  });
});

describe('pela maps without central topic (BL-43)', () => {
  test('loads an empty pela map', () => {
    const mindmap = load('<map version="pela"/>');
    expect(mindmap.getBranches()).toEqual([]);
    expect(mindmap.getVersion()).toBe('tango');
  });

  test('loads an empty beta map', () => {
    expect(load('<map/>').getBranches()).toEqual([]);
  });
});

describe('plain text content (BL-45)', () => {
  test('reads a note and a topic text stored as plain text, without CDATA', () => {
    const mindmap = load(
      '<map version="tango"><topic central="true" id="1"><text>Line 1\nLine 2</text>' +
        '<note>Plain &amp; simple</note></topic></map>',
    );
    const central = node(mindmap, 1);
    expect(central.getText()).toBe('Line 1\nLine 2');
    expect(noteOf(central).getText()).toBe('Plain & simple');
  });

  test('ignores the indentation around a CDATA section', () => {
    const mindmap = load(
      '<map version="tango"><topic central="true" id="1">\n  <text>\n    <![CDATA[A\nB]]>\n  </text>' +
        '<note>\n    <![CDATA[note]]></note></topic></map>',
    );
    const central = node(mindmap, 1);
    expect(central.getText()).toBe('A\nB');
    expect(noteOf(central).getText()).toBe('note');
  });

  test('still treats an element with only whitespace as empty', () => {
    const mindmap = load(
      '<map version="tango"><topic central="true" id="1" text="c"><note>\n  </note></topic></map>',
    );
    expect(noteOf(node(mindmap, 1)).getText()).toBe(' ');
  });
});

describe('PersistenceManager.save errors (BL-54)', () => {
  class FailingManager extends PersistenceManager {
    saveMapXml(): void {
      throw new Error('storage full');
    }

    discardChanges(): void {
      // Not used.
    }

    loadMapDom(): Promise<Document> {
      return Promise.reject(new Error('not used'));
    }

    unlockMap(): void {
      // Not used.
    }
  }

  test('reports a thrown error as a PersistenceError', () => {
    const mindmap = load('<map version="tango"><topic central="true" id="1" text="c"/></map>');
    const onError = jest.fn();

    new FailingManager().save(mindmap, {}, false, { onSuccess: jest.fn(), onError });

    expect(onError).toHaveBeenCalledTimes(1);
    const error = onError.mock.calls[0][0];
    expect(error).not.toBeInstanceOf(Error);
    expect(error).toEqual({
      severity: 'SEVERE',
      errorType: 'unexpected',
      message: expect.any(String),
    });
  });

  test('reports a serialization error as a PersistenceError (BL4-17)', () => {
    const mindmap = load('<map version="tango"><topic central="true" id="1" text="c"/></map>');
    const serializer = XMLSerializerFactory.createFromMindmap(mindmap);
    jest.spyOn(XMLSerializerFactory, 'createFromMindmap').mockReturnValue(serializer);
    jest.spyOn(serializer, 'toXML').mockImplementation(() => {
      throw new Error('corrupted topic');
    });
    const onError = jest.fn();

    expect(() =>
      new FailingManager().save(mindmap, {}, false, { onSuccess: jest.fn(), onError }),
    ).not.toThrow();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toEqual({
      severity: 'SEVERE',
      errorType: 'unexpected',
      message: expect.any(String),
    });
  });
});

describe('node model (BL-17, BL-75)', () => {
  test('getText reports a missing text as undefined', () => {
    const mindmap = new Mindmap('map');
    const topic = mindmap.createNode('MainTopic');
    expect(topic.getText()).toBeUndefined();
  });

  test('hasPosition and getPositionOrThrow tell a missing position apart', () => {
    const mindmap = new Mindmap('map');
    const topic = mindmap.createNode('MainTopic');
    expect(topic.hasPosition()).toBe(false);
    expect(() => topic.getPositionOrThrow()).toThrow(/position/);

    topic.setPosition(10, -5);
    expect(topic.hasPosition()).toBe(true);
    expect(topic.getPositionOrThrow()).toEqual({ x: 10, y: -5 });
  });

  test('a corrupted stored position counts as missing', () => {
    const mindmap = new Mindmap('map');
    const topic = mindmap.createNode('MainTopic');
    topic.putProperty('position', { x: NaN, y: 0 });
    expect(topic.hasPosition()).toBe(false);
  });
});

describe('feature attributes (BL-14)', () => {
  test('LinkModel maps url and urlType to its setters', () => {
    const link = FeatureModelFactory.createModel('link', { url: 'http://a.com' }) as LinkModel;
    link.setAttributes({ url: 'mailto:me@b.com' });
    expect(link.getUrl()).toBe('mailto:me@b.com');
    expect(link.getAttribute('urlType')).toBe('mail');

    link.setAttributes({ url: 'javascript:alert(1)' });
    expect(link.getUrl()).toBe('http://javascript:alert(1)');

    link.setAttributes({ urlType: 'url' });
    expect(link.getAttribute('urlType')).toBe('url');
  });

  test('the base class stores unknown attributes as they are, without calling setters', () => {
    class TestFeature extends FeatureModel {
      calls: unknown[] = [];

      constructor() {
        super('note');
      }

      setColor(value: unknown): void {
        this.calls.push(value);
      }
    }

    const feature = new TestFeature();
    feature.setAttributes({ color: 'red' });
    expect(feature.calls).toEqual([]);
    expect(feature.getAttribute('color')).toBe('red');
  });
});
