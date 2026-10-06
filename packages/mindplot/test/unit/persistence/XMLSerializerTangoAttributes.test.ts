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
import XMLSerializerTango from '../../../src/components/persistence/XMLSerializerTango';

const load = (xml: string): Mindmap => {
  const dom = new DOMParser().parseFromString(xml, 'text/xml');
  return new XMLSerializerTango().loadFromDom(dom, 'map');
};

const save = (mindmap: Mindmap): Element => new XMLSerializerTango().toXML(mindmap).documentElement;

const roundTrip = (mindmap: Mindmap): Mindmap =>
  load(new XMLSerializer().serializeToString(new XMLSerializerTango().toXML(mindmap)));

const map = (body: string, attributes = '') =>
  `<map name="m" version="tango"${attributes}><topic central="true" text="C" id="1">${body}</topic></map>`;

afterEach(() => {
  jest.restoreAllMocks();
});

describe('XMLSerializerTango canvas style', () => {
  it('saves and loads a custom canvas', () => {
    const mindmap = load(map(''));
    const style = {
      backgroundColor: '#123456',
      backgroundPattern: 'dots' as const,
      backgroundGridSize: 24,
      backgroundGridColor: '#abcdef',
    };
    mindmap.setCanvasStyle(style);

    const element = save(mindmap);
    expect(element.getAttribute('backgroundColor')).toBe('#123456');
    expect(element.getAttribute('backgroundPattern')).toBe('dots');
    expect(element.getAttribute('backgroundGridSize')).toBe('24');
    expect(element.getAttribute('backgroundGridColor')).toBe('#abcdef');
    expect(roundTrip(mindmap).getCanvasStyle()).toEqual(style);
  });

  it('writes no canvas attribute for the theme canvas', () => {
    const element = save(load(map('')));
    ['backgroundColor', 'backgroundPattern', 'backgroundGridSize', 'backgroundGridColor'].forEach(
      (name) => expect(element.hasAttribute(name)).toBe(false),
    );
    expect(load(map('')).getCanvasStyle()).toBeUndefined();
  });

  it('ignores a grid size that is not a number', () => {
    const mindmap = load(
      map('', ' backgroundPattern="grid" backgroundGridSize="big" backgroundColor="#fff"'),
    );
    expect(mindmap.getCanvasStyle()).toEqual({
      backgroundPattern: 'grid',
      backgroundColor: '#fff',
    });
  });
});

describe('XMLSerializerTango topic attributes', () => {
  it('saves and loads an image topic with its size and url', () => {
    const mindmap = load(
      map('<topic id="2" text="I" shape="image" image="80,40:https://x/y.png"/>'),
    );
    const image = mindmap.findNodeById(2)!;
    expect(image.getImageSize()).toEqual({ width: 80, height: 40 });
    expect(image.getImageUrl()).toBe('https://x/y.png');

    const saved = save(mindmap).querySelector('topic[id="2"]')!;
    expect(saved.getAttribute('image')).toBe('80,40:https://x/y.png');
  });

  it('saves and loads the border style', () => {
    const mindmap = load(map('<topic id="2" text="B" brStyle="dotted"/>'));
    expect(mindmap.findNodeById(2)!.getBorderStyle()).toBe('dotted');
    expect(save(mindmap).querySelector('topic[id="2"]')!.getAttribute('brStyle')).toBe('dotted');
    expect(roundTrip(mindmap).findNodeById(2)!.getBorderStyle()).toBe('dotted');
  });

  it('loads a topic without border style, as old maps have, with the default border', () => {
    const mindmap = load(map('<topic id="2" text="B"/>'));
    expect(mindmap.findNodeById(2)!.getBorderStyle()).toBeUndefined();
    expect(save(mindmap).querySelector('topic[id="2"]')!.hasAttribute('brStyle')).toBe(false);
  });

  it('ignores an unknown border style', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const mindmap = load(map('<topic id="2" text="B" brStyle="wavy"/>'));
    expect(mindmap.findNodeById(2)!.getBorderStyle()).toBeUndefined();
    expect(String(warn.mock.calls[0][0])).toContain("Unknown border style 'wavy'");
  });

  it('saves and loads the metadata', () => {
    const mindmap = load(map('<topic id="2" text="M" metadata="{&quot;k&quot;:1}"/>'));
    expect(mindmap.findNodeById(2)!.getMetadata()).toBe('{"k":1}');
    expect(roundTrip(mindmap).findNodeById(2)!.getMetadata()).toBe('{"k":1}');
  });

  it('skips an order that is not a number', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const mindmap = load(map('<topic id="2" text="O" order="first" position="10,10"/>'));
    expect(mindmap.findNodeById(2)!.getOrder()).toBeUndefined();
    expect(String(warn.mock.calls[0][0])).toContain('Invalid order value in XML: "first"');
  });

  it('gives a new id to a topic whose id is already used', () => {
    const mindmap = load(map('<topic id="2" text="first"/><topic id="2" text="second"/>'));
    const ids = mindmap
      .getCentralTopic()
      .getChildren()
      .map((child) => child.getId());
    expect(ids[0]).toBe(2);
    expect(ids[1]).not.toBe(2);
  });

  // Bug: a duplicated id is replaced with INodeModel._nextUUID() (XMLSerializerTango.ts:472),
  // the highest id seen so far plus one. That id can belong to a topic further down the file,
  // which is then seen as a duplicate too and renumbered: relationships to it now point to the
  // renumbered duplicate instead.
  it.failing('keeps the ids of the topics after a duplicated one', () => {
    const mindmap = load(
      map(
        '<topic id="5000" text="first"/><topic id="5000" text="duplicate"/>' +
          '<topic id="5001" text="target"/>',
      ).replace('</map>', '<relationship srcTopicId="5000" destTopicId="5001"/></map>'),
    );
    expect(mindmap.findNodeById(5001)!.getText()).toBe('target');
  });
});

describe('XMLSerializerTango relationships', () => {
  it('drops a relationship from a topic to itself', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const mindmap = load(
      map('<topic id="2" text="T"/>').replace(
        '</map>',
        '<relationship srcTopicId="2" destTopicId="2"/></map>',
      ),
    );
    expect(mindmap.getRelationships()).toHaveLength(0);
    expect(error).toHaveBeenCalled();
  });

  it('keeps a relationship whose control points can not be read, without them', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const mindmap = load(
      map('<topic id="2" text="A"/><topic id="3" text="B"/>').replace(
        '</map>',
        '<relationship srcTopicId="2" destTopicId="3" srcCtrlPoint="x" destCtrlPoint="1,y"/></map>',
      ),
    );
    const [relationship] = mindmap.getRelationships();
    expect(relationship.getFromNode()).toBe(2);
    expect(relationship.getSrcCtrlPoint()).toBeNull();
    expect(relationship.getDestCtrlPoint()).toBeNull();
    expect(error).toHaveBeenCalledTimes(2);
  });

  it('saves and loads the control points and arrows', () => {
    const mindmap = load(
      map('<topic id="2" text="A"/><topic id="3" text="B"/>').replace(
        '</map>',
        '<relationship srcTopicId="2" destTopicId="3" srcCtrlPoint="10,20" destCtrlPoint="-5,7" endArrow="false" startArrow="true"/></map>',
      ),
    );
    const [relationship] = roundTrip(mindmap).getRelationships();
    expect(relationship.getSrcCtrlPoint()).toEqual({ x: 10, y: 20 });
    expect(relationship.getDestCtrlPoint()).toEqual({ x: -5, y: 7 });
    expect(relationship.getEndArrow()).toBe(false);
    expect(relationship.getStartArrow()).toBe(true);
  });
});

describe('XMLSerializerTango map attributes', () => {
  it('saves the version, but not the description, which the server keeps', () => {
    const mindmap = load(map(''));
    mindmap.setDescription('About');
    const element = save(mindmap);
    expect(element.getAttribute('version')).toBe('tango');
    expect(element.getAttribute('name')).toBe('map');
    expect(roundTrip(mindmap).getDescription()).toBe('');
  });
});
