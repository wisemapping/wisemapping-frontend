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
import { describe, expect, it } from '@jest/globals';
import { LineType } from '../../../src/components/ConnectionLine';
import type Mindmap from '../../../src/components/model/Mindmap';
import XMLSerializerTango from '../../../src/components/persistence/XMLSerializerTango';

// A topic's connection style is saved as connStyle="N", the LineType value. Saved maps carry
// these numbers, so each one is pinned here: renumbering a member would change existing maps.
const PERSISTED: [keyof typeof LineType, number][] = [
  ['THIN_CURVED', 0],
  ['POLYLINE_MIDDLE', 1],
  ['POLYLINE_CURVED', 2],
  ['POLYLINE_STRAIGHT', 3],
  ['THICK_CURVED', 4],
  ['THICK_CURVED_ORGANIC', 5],
  ['ARC', 6],
  ['HEARTBEAT', 7],
  ['NEURON', 8],
];

const load = (connStyle: number): Mindmap =>
  new XMLSerializerTango().loadFromDom(
    new DOMParser().parseFromString(
      [
        '<map name="connStyle" version="tango">',
        `  <topic id="0" central="true" text="Central" connStyle="${connStyle}">`,
        '    <topic id="1" text="A" position="200,0" order="0"/>',
        '  </topic>',
        '</map>',
      ].join('\n'),
      'text/xml',
    ),
    'map',
  );

describe('LineType persisted values (T5)', () => {
  it('has exactly the pinned members', () => {
    const members = Object.keys(LineType).filter((key) => Number.isNaN(Number(key)));
    expect(members).toEqual(PERSISTED.map(([name]) => name));
  });

  it.each(PERSISTED)('%s is connStyle="%i", loaded and saved back as is', (name, value) => {
    expect(LineType[name]).toBe(value);

    const mindmap = load(value);
    const central = mindmap.getBranches()[0]!;
    expect(central.getConnectionStyle()).toBe(LineType[name]);
    const saved = new XMLSerializer().serializeToString(new XMLSerializerTango().toXML(mindmap));
    expect(saved).toContain(`connStyle="${value}"`);
  });
});
