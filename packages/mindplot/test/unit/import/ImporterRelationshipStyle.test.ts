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

import { describe, expect, test } from '@jest/globals';
import FreeplaneImporter from '../../../src/components/import/FreeplaneImporter';
import MindManagerImporter from '../../../src/components/import/MindManagerImporter';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import Mindmap from '../../../src/components/model/Mindmap';
import { StrokeStyle } from '../../../src/components/model/RelationshipModel';

// Dash styles are a stroke style. Relationships are always drawn thin curved.

const loadMindmap = (xml: string): Mindmap => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return XMLSerializerFactory.createFromDocument(doc).loadFromDom(doc, 'test');
};

describe('FreeplaneImporter relationship style', () => {
  // DASH holds the dash pattern of Freeplane's Dash enum: none is SOLID, "3 3" CLOSE_DOTS,
  // "7 7" DASHES, "2 7" DISTANT_DOTS and "2 7 7 7" DOTS_AND_DASHES.
  const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root" ID="ID_1">
    <node TEXT="A" ID="ID_2">
      <arrowlink DESTINATION="ID_3"/>
      <arrowlink DESTINATION="ID_3" DASH="3 3"/>
      <arrowlink DESTINATION="ID_3" DASH="7 7"/>
      <arrowlink DESTINATION="ID_4" DASH="2 7"/>
      <arrowlink DESTINATION="ID_4" DASH="2 7 7 7"/>
    </node>
    <node TEXT="B" ID="ID_3"/>
    <node TEXT="C" ID="ID_4"/>
  </node>
</map>`;

  test('maps DASH to the closest stroke style', async () => {
    const mindmap = loadMindmap(await new FreeplaneImporter(freeplane).import('test'));

    const relationships = mindmap.getRelationships();
    expect(relationships.map((r) => r.getStrokeStyle())).toEqual([
      StrokeStyle.SOLID,
      StrokeStyle.DOTTED,
      StrokeStyle.DASHED,
      StrokeStyle.DOTTED,
      StrokeStyle.DASHED,
    ]);
  });
});

describe('MindManagerImporter relationship style', () => {
  const mindManager = `<?xml version="1.0" encoding="UTF-8"?>
<Map xmlns="http://www.mindjet.com/MindManager/MindMapXML/1.0">
  <Topic ID="1" Text="Root">
    <Topic ID="2" Text="A"/>
    <Topic ID="3" Text="B"/>
  </Topic>
  <Relationships>
    <Relationship FromTopicID="2" ToTopicID="3" LineStyle="Dashed"/>
    <Relationship FromTopicID="3" ToTopicID="2" LineStyle="Dotted"/>
    <Relationship FromTopicID="2" ToTopicID="3" LineStyle="Solid"/>
  </Relationships>
</Map>`;

  test('maps LineStyle to the stroke style', async () => {
    const mindmap = loadMindmap(await new MindManagerImporter(mindManager).import('test'));

    const relationships = mindmap.getRelationships();
    expect(relationships.map((r) => r.getStrokeStyle())).toEqual([
      StrokeStyle.DASHED,
      StrokeStyle.DOTTED,
      StrokeStyle.SOLID,
    ]);
  });
});
