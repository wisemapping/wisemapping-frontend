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

import NodeModel from '../../../src/components/model/NodeModel';
import type Mindmap from '../../../src/components/model/Mindmap';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import { buildMediumMap } from '../designer/medium-map';

const load = (xml: string): Mindmap => {
  const document = new DOMParser().parseFromString(xml, 'text/xml');
  return XMLSerializerFactory.createFromDocument(document).loadFromDom(document, 'map');
};

const save = (mindmap: Mindmap): Document =>
  XMLSerializerFactory.createFromMindmap(mindmap).toXML(mindmap);

/*
 * Saving and loading check that both ends of each relationship are in the map. That must not
 * search the whole map for each relationship. The test counts the searches, never the time.
 */
describe('Relationship endpoints on save and load', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('are checked against the ids of the map, not by searching it for each one', () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const xml = buildMediumMap({ topics: 500, relationships: 50 });
    const findNodeById = jest.spyOn(NodeModel.prototype, 'findNodeById');

    const mindmap = load(xml);
    expect(mindmap.getRelationships()).toHaveLength(50);
    expect(save(mindmap).getElementsByTagName('relationship')).toHaveLength(50);

    // Before: 50,476 calls, a search of the map for each end on load and on save.
    expect(findNodeById).not.toHaveBeenCalled();
  });

  it('still drops a relationship with a missing end, on load and on save', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const mindmap = load(
      [
        '<map name="m" version="tango">',
        '  <topic id="0" central="true" text="Central">',
        '    <topic id="1" text="A" position="200,0" order="0"/>',
        '  </topic>',
        '  <topic id="2" text="Floating" position="400,400"/>',
        '  <relationship id="10" srcTopicId="1" destTopicId="2" lineType="3"/>',
        '  <relationship id="11" srcTopicId="1" destTopicId="99" lineType="3"/>',
        '</map>',
      ].join('\n'),
    );
    expect(mindmap.getRelationships().map((r) => r.getToNode())).toEqual([2]);
    expect(error).toHaveBeenCalled();

    // A relationship whose end was removed since is not saved.
    mindmap.addRelationship(mindmap.createRelationship(2, 98));
    const saved = save(mindmap).getElementsByTagName('relationship');
    expect(Array.from(saved).map((r) => r.getAttribute('destTopicId'))).toEqual(['2']);
  });

  it('lists every node id of the map', () => {
    const mindmap = load(buildMediumMap({ topics: 120, relationships: 0 }));
    const ids = mindmap.getNodeIds();
    expect(ids.size).toBe(120);
    for (let id = 0; id < 120; id++) {
      expect(ids.has(id)).toBe(mindmap.findNodeById(id) !== undefined);
    }
    expect(ids.has(120)).toBe(false);
  });
});
