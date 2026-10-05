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

/**
 * Relationships are always drawn thin curved, whatever their lineType. The attribute is kept for
 * compatibility: saved maps carry 3, SIMPLE_CURVED in the numbering of the time, which today's
 * LineType reads as POLYLINE_STRAIGHT (BL4-32).
 */
const mapWith = (relationship: string) =>
  [
    '<map name="lineType" version="tango">',
    '  <topic id="0" central="true" text="Central">',
    '    <topic id="1" text="A" position="200,0" order="0"/>',
    '    <topic id="2" text="B" position="-200,0" order="1"/>',
    '  </topic>',
    `  ${relationship}`,
    '</map>',
  ].join('\n');

const load = (xml: string): Mindmap =>
  new XMLSerializerTango().loadFromDom(new DOMParser().parseFromString(xml, 'text/xml'), 'map');

const savedLineTypes = (mindmap: Mindmap): (string | null)[] =>
  Array.from(new XMLSerializerTango().toXML(mindmap).getElementsByTagName('relationship')).map(
    (element) => element.getAttribute('lineType'),
  );

describe('Tango relationship lineType (BL4-32)', () => {
  it.each(['3', '0', '1', '6', 'curved', null])(
    'ignores a stored lineType of %s and saves the legacy one',
    (lineType) => {
      const attribute = lineType === null ? '' : ` lineType="${lineType}"`;
      const mindmap = load(mapWith(`<relationship srcTopicId="1" destTopicId="2"${attribute}/>`));

      // It is ignored, and saved back with the legacy value every map carries.
      expect(savedLineTypes(mindmap)).toEqual(['3']);
    },
  );

  it('saves a new relationship with the same legacy value as a loaded one', () => {
    const mindmap = load(
      mapWith('<relationship srcTopicId="1" destTopicId="2" lineType="3" endArrow="true"/>'),
    );
    mindmap.addRelationship(mindmap.createRelationship(2, 1));

    expect(savedLineTypes(mindmap)).toEqual(['3', '3']);
  });
});
