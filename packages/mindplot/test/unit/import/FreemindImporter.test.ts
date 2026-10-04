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

/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import path from 'path';
import { describe, expect, test } from '@jest/globals';
import FreemindImporter from '../../../src/components/import/FreemindImporter';

const importMap = async (mm: string): Promise<Document> => {
  const xml = await new FreemindImporter(mm).import('test', '');
  return new DOMParser().parseFromString(xml, 'text/xml');
};

const topicById = (doc: Document, id: string): Element => {
  const result = doc.querySelector(`topic[id="${id}"]`);
  if (!result) {
    throw new Error(`Topic ${id} not found`);
  }
  return result;
};

const positionOf = (topic: Element): { x: number; y: number } => {
  const [x, y] = (topic.getAttribute('position') || '').split(',').map(Number);
  return { x, y };
};

describe('FreemindImporter', () => {
  test('imports maps written by FreeMind versions older than 1.0.1', async () => {
    const mm = `<map version="0.9.0"><node ID="ID_1" TEXT="Root"><node ID="ID_2" TEXT="Child" POSITION="right"/></node></map>`;

    const doc = await importMap(mm);
    expect(topicById(doc, '2').getAttribute('text')).toBe('Child');
  });

  test('rejects maps written by FreeMind versions newer than the supported one', () => {
    const mm = `<map version="1.1.0"><node ID="ID_1" TEXT="Root"/></map>`;

    expect(() => new FreemindImporter(mm).import('test', '')).toThrow(
      'FreeMind version 1.1.0 is not supported.',
    );
  });

  test('keeps arrowlinks that point to nodes appearing later in the document', async () => {
    const mm = `<map version="1.0.1">
      <node ID="ID_1" TEXT="Root">
        <node ID="ID_2" TEXT="Source" POSITION="right">
          <arrowlink DESTINATION="ID_3" STARTARROW="None" ENDARROW="Default"/>
        </node>
        <node ID="ID_3" TEXT="Target" POSITION="right"/>
      </node>
    </map>`;

    const doc = await importMap(mm);
    const relationships = Array.from(doc.querySelectorAll('relationship'));
    expect(relationships).toHaveLength(1);
    expect(relationships[0].getAttribute('srcTopicId')).toBe('2');
    expect(relationships[0].getAttribute('destTopicId')).toBe('3');
  });

  test('does not duplicate relationships', async () => {
    const mm = `<map version="1.0.1">
      <node ID="ID_1" TEXT="Root">
        <node ID="ID_2" TEXT="Target" POSITION="right"/>
        <node ID="ID_3" TEXT="Source" POSITION="right">
          <arrowlink DESTINATION="ID_2" STARTARROW="None" ENDARROW="Default"/>
        </node>
      </node>
    </map>`;

    const doc = await importMap(mm);
    expect(doc.querySelectorAll('relationship')).toHaveLength(1);
  });

  test('mirrors the arrowlink inclination of topics on the left side', async () => {
    const mm = `<map version="1.0.1">
      <node ID="ID_1" TEXT="Root">
        <node ID="ID_2" TEXT="Source" POSITION="left">
          <arrowlink DESTINATION="ID_3" STARTINCLINATION="20;-58;" ENDINCLINATION="101;-78;"/>
        </node>
        <node ID="ID_3" TEXT="Target" POSITION="right"/>
      </node>
    </map>`;

    const doc = await importMap(mm);
    const relationship = doc.querySelector('relationship')!;
    expect(relationship.getAttribute('srcCtrlPoint')).toBe('-20,-58');
    expect(relationship.getAttribute('destCtrlPoint')).toBe('101,-78');
  });

  test('imports the writing_an_essay_with arrowlinks', async () => {
    const mm = fs.readFileSync(
      path.resolve(__dirname, './input/writing_an_essay_with.mm'),
      'utf-8',
    );

    const doc = await importMap(mm);
    expect(doc.querySelectorAll('relationship')).toHaveLength(6);
  });

  test('places nested topics one level further than their parent, on the same side', async () => {
    const mm = `<map version="1.0.1">
      <node ID="ID_1" TEXT="Root">
        <node ID="ID_2" TEXT="Left" POSITION="left">
          <node ID="ID_3" TEXT="Left child">
            <node ID="ID_4" TEXT="Left grandchild"/>
          </node>
          <node ID="ID_5" TEXT="Left child 2"/>
        </node>
        <node ID="ID_6" TEXT="Right" POSITION="right"/>
        <node ID="ID_7" TEXT="Right 2" POSITION="right">
          <node ID="ID_8" TEXT="Right child"/>
        </node>
      </node>
    </map>`;

    const doc = await importMap(mm);
    // Depth 1: 200, depth 2: 290, depth 3: 380
    expect(positionOf(topicById(doc, '2')).x).toBe(-200);
    expect(positionOf(topicById(doc, '3')).x).toBe(-290);
    expect(positionOf(topicById(doc, '4')).x).toBe(-380);
    expect(positionOf(topicById(doc, '5')).x).toBe(-290);
    expect(positionOf(topicById(doc, '7')).x).toBe(200);
    expect(positionOf(topicById(doc, '8')).x).toBe(290);
  });

  test('attaches features that follow a child node to the parent node', async () => {
    const mm = `<map version="1.0.1">
      <node ID="ID_1" TEXT="Root">
        <node ID="ID_2" TEXT="Parent" POSITION="right">
          <node ID="ID_3" TEXT="Child"/>
          <richcontent TYPE="NOTE"><html><head/><body><p>Parent note</p></body></html></richcontent>
        </node>
      </node>
    </map>`;

    const doc = await importMap(mm);
    const parentNote = topicById(doc, '2').querySelector(':scope > note');
    const childNote = topicById(doc, '3').querySelector(':scope > note');
    expect(parentNote?.textContent).toContain('Parent note');
    expect(childNote).toBeNull();
  });
});
