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
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';
import FeatureModelFactory from '../../../src/components/model/FeatureModelFactory';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import { StrokeStyle } from '../../../src/components/model/RelationshipModel';

// T4: the attributes of a map are untrusted. An invalid value falls back to the default instead of
// being cast to its type.

const load = (xml: string): Mindmap => {
  const dom = new DOMParser().parseFromString(xml, 'text/xml');
  return XMLSerializerFactory.createFromDocument(dom).loadFromDom(dom, 'map');
};

const save = (mindmap: Mindmap): string =>
  new XMLSerializer().serializeToString(
    XMLSerializerFactory.createFromMindmap(mindmap).toXML(mindmap),
  );

// A map of the given version with one child topic carrying the given attributes and content.
const loadMap = (version: string, mapAttrs: string, topicAttrs = '', content = ''): Mindmap => {
  const versionAttr = version === 'beta' ? '' : ` version="${version}"`;
  return load(
    `<map${versionAttr} ${mapAttrs}><topic central="true" id="1" text="c">` +
      `<topic id="2" position="200,0" order="0" text="t" ${topicAttrs}>${content}</topic>` +
      '</topic><topic id="3" position="-200,0" order="1" text="u"/>' +
      `${version === 'beta' ? '' : '<relationship srcTopicId="2" destTopicId="3" strokeStyle="wavy"/>'}` +
      '</map>',
  );
};

const child = (mindmap: Mindmap): NodeModel => mindmap.getBranches()[0]!.getChildren()[0]!;

let warn: jest.SpiedFunction<typeof console.warn>;

beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe.each(['tango', 'pela'])('%s map attributes', (version) => {
  test('an unknown theme falls back to classic', () => {
    expect(loadMap(version, 'theme="bogus"').getTheme()).toBe('classic');
    expect(loadMap(version, 'theme="robot"').getTheme()).toBe('robot');
  });

  test('an unknown layout falls back to mindmap', () => {
    expect(loadMap(version, 'layout="spiral"').getLayout()).toBe('mindmap');
    expect(loadMap(version, 'layout="tree"').getLayout()).toBe('tree');
  });

  test('an unknown background pattern is ignored', () => {
    expect(loadMap(version, 'backgroundPattern="stripes"').getCanvasStyle()).toBeUndefined();
    expect(loadMap(version, 'backgroundPattern="dots"').getCanvasStyle()).toEqual({
      backgroundPattern: 'dots',
    });
  });

  test('an unknown relationship stroke style falls back to dashed', () => {
    const [relationship] = loadMap(version, '').getRelationships();
    expect(relationship!.getStrokeStyle()).toBe(StrokeStyle.DASHED);
  });
});

describe.each(['tango', 'pela', 'beta'])('%s topic attributes', (version) => {
  const topic = (attrs: string, content = ''): NodeModel =>
    child(loadMap(version, '', attrs, content));

  test('an unknown font weight is ignored', () => {
    expect(topic('fontStyle=";;;heavy;;"').getFontWeight()).toBeUndefined();
    expect(topic('fontStyle=";;;600;;"').getFontWeight()).toBe('600');
  });

  test('an unknown font style is ignored', () => {
    expect(topic('fontStyle=";;;;slanted;"').getFontStyle()).toBeUndefined();
    expect(topic('fontStyle=";;;;italic;"').getFontStyle()).toBe('italic');
  });

  test('an unknown shape is ignored', () => {
    expect(topic('shape="hexagon"').getShapeType()).toBeUndefined();
    expect(topic('shape="line"').getShapeType()).toBe('line');
  });

  if (version !== 'beta') {
    test('an unknown connection style is ignored', () => {
      expect(topic('connStyle="42"').getConnectionStyle()).toBeUndefined();
      expect(topic('connStyle="1"').getConnectionStyle()).toBe(1);
    });

    test('an unknown note content type falls back to plain', () => {
      const note = (contentType: string) =>
        topic('', `<note contentType="${contentType}"><![CDATA[n]]></note>`).findFeatureByType(
          'note',
        )[0];

      expect(note('markdown')!.getContentType()).toBe('plain');
      expect(note('markdown')!.getAttributes()).not.toHaveProperty('contentType');
      expect(note('html')!.getContentType()).toBe('html');
    });
  }
});

describe('note content type', () => {
  test('an unknown content type is not written back', () => {
    const mindmap = loadMap('tango', '', '', '<note contentType="markdown"><![CDATA[n]]></note>');
    expect(save(mindmap)).not.toContain('markdown');
    expect(warn).toHaveBeenCalled();
  });

  test('a command can not set an unknown content type', () => {
    const note = FeatureModelFactory.createModel('note', { text: 'n', contentType: 'html' });
    note.setAttributes({ contentType: 'markdown' });
    expect(note.getContentType()).toBe('html');
    note.setAttributes({ contentType: 'plain' });
    expect(note.getContentType()).toBe('plain');
  });
});
