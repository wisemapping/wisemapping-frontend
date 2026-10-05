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

import { describe, expect, jest, test } from '@jest/globals';
import FreemindMap from '../../../src/components/export/freemind/Map';
import FreemindNode, { Choise } from '../../../src/components/export/freemind/Node';

const roundTrip = (mm: string): Document => {
  const dom = new DOMParser().parseFromString(mm, 'text/xml');
  const xml = new FreemindMap().loadFromDom(dom).toXml();
  return new DOMParser().parseFromString(new XMLSerializer().serializeToString(xml), 'text/xml');
};

const childTags = (element: Element | null): string[] =>
  Array.from(element?.children || []).map((child) => child.tagName);

describe('FreemindMap', () => {
  test('writes every element kind with its attributes in a fixed order', () => {
    // Attributes in reverse order, so the writer order is the one pinned below. The central node
    // writes its text right after its id; DASH (Freeplane) and unknown elements are not read.
    const doc = roundTrip(`<map version="1.0.1">
      <node ENCRYPTED_CONTENT="enc" VSHIFT="9" WORDER="8" WCOORDS="7" VGAP="6" HGAP="5"
        MODIFIED="4" CREATED="3" FOLDED="true" LINK="https://a.b" TEXT="Root" COLOR="#000001"
        BACKGROUND_COLOR="#000002" STYLE="bubble" POSITION="left" ID="ID_1">
        <font NAME="Arial" ITALIC="true" BOLD="true"/>
        <font SIZE="18"/>
        <edge WIDTH="2" STYLE="bezier" COLOR="#000003"/>
        <arrowlink STARTINCLINATION="1;2" ID="A_1" ENDARROW="Default" ENDINCLINATION="3;4"
          COLOR="#000004" STARTARROW="None" DESTINATION="ID_2" DASH="3 3"/>
        <cloud COLOR="#000005"/>
        <cloud/>
        <icon BUILTIN="idea"/>
        <hook NAME="plugin"><text>Old note</text></hook>
        <hook/>
        <richcontent TYPE="NOTE"><html><body><p>Note</p></body></html></richcontent>
        <richcontent TYPE="NODE"/>
        <unknown/>
        <node COLOR="#000006" TEXT="Child" POSITION="right" ID="ID_2"/>
        <node TEXT="" ID="ID_3"/>
      </node>
    </map>`);

    expect(new XMLSerializer().serializeToString(doc)).toBe(
      '<map version="1.0.1">' +
        '<node ID="ID_1" TEXT="Root" POSITION="left" STYLE="bubble" BACKGROUND_COLOR="#000002" COLOR="#000001" LINK="https://a.b" FOLDED="true" CREATED="3" MODIFIED="4" HGAP="5" VGAP="6" WCOORDS="7" WORDER="8" VSHIFT="9" ENCRYPTED_CONTENT="enc">' +
        '<font SIZE="12" BOLD="true" ITALIC="true" NAME="Arial"/>' +
        '<font SIZE="18"/>' +
        '<edge COLOR="#000003" STYLE="bezier" WIDTH="2"/>' +
        '<arrowlink DESTINATION="ID_2" STARTARROW="None" COLOR="#000004" ENDINCLINATION="3;4" ENDARROW="Default" ID="A_1" STARTINCLINATION="1;2"/>' +
        '<cloud COLOR="#000005"/>' +
        '<cloud/>' +
        '<icon BUILTIN="idea"/>' +
        '<hook NAME="plugin"><text>Old note</text></hook>' +
        '<hook/>' +
        '<richcontent TYPE="NOTE"><html xmlns="http://www.w3.org/1999/xhtml"><body><p>Note</p></body></html></richcontent>' +
        '<richcontent TYPE="NODE"/>' +
        '<node ID="ID_2" POSITION="right" COLOR="#000006" TEXT="Child"/>' +
        '<node ID="ID_3"/>' +
        '</node></map>',
    );
  });

  test('keeps the icons, notes and arrowlinks of the root node', () => {
    const doc = roundTrip(`<map version="1.0.1">
      <node ID="ID_1" TEXT="Root">
        <icon BUILTIN="idea"/>
        <richcontent TYPE="NOTE"><html><body><p>Root note</p></body></html></richcontent>
        <arrowlink DESTINATION="ID_2"/>
        <node ID="ID_2" TEXT="Child" POSITION="right"/>
      </node>
    </map>`);

    expect(childTags(doc.querySelector('map > node'))).toEqual([
      'icon',
      'richcontent',
      'arrowlink',
      'node',
    ]);
  });

  test('keeps the attributes of the root node (BL5-12)', () => {
    const doc = roundTrip(`<map version="1.0.1">
      <node ID="ID_1" TEXT="Root" STYLE="bubble" LINK="https://www.wisemapping.com" FOLDED="true"
        BACKGROUND_COLOR="#ff0000" COLOR="#00ff00" CREATED="1" MODIFIED="2"/>
    </map>`);

    const root = doc.querySelector('map > node')!;
    expect(Object.fromEntries(Array.from(root.attributes).map((a) => [a.name, a.value]))).toEqual({
      ID: 'ID_1',
      TEXT: 'Root',
      STYLE: 'bubble',
      LINK: 'https://www.wisemapping.com',
      FOLDED: 'true',
      BACKGROUND_COLOR: '#ff0000',
      COLOR: '#00ff00',
      CREATED: '1',
      MODIFIED: '2',
    });
  });

  test('writes an empty text for a root node without text', () => {
    const doc = roundTrip('<map version="1.0.1"><node ID="ID_1"/></map>');

    expect(doc.querySelector('map > node')?.getAttribute('TEXT')).toBe('');
  });

  test('finds the root node when other elements precede it', () => {
    const doc = roundTrip(`<map version="1.0.1">
      <attribute_registry SHOW_ATTRIBUTES="hide"/>
      <node ID="ID_1" TEXT="Root"><node ID="ID_2" TEXT="Child" POSITION="right"/></node>
    </map>`);

    const root = doc.querySelector('map > node');
    expect(root?.getAttribute('TEXT')).toBe('Root');
    expect(root?.querySelector(':scope > node')?.getAttribute('TEXT')).toBe('Child');
  });

  test('keeps clouds and hooks', () => {
    const doc = roundTrip(`<map version="1.0.1">
      <node ID="ID_1" TEXT="Root">
        <node ID="ID_2" TEXT="Child" POSITION="right">
          <cloud COLOR="#ff0000"/>
          <hook NAME="accessories/plugins/NodeNote.properties"><text>Old note</text></hook>
        </node>
      </node>
    </map>`);

    const child = doc.querySelector('node[ID="ID_2"]');
    expect(childTags(child)).toEqual(['cloud', 'hook']);
    expect(child?.querySelector('cloud')?.getAttribute('COLOR')).toBe('#ff0000');
    expect(child?.querySelector('hook')?.getAttribute('NAME')).toBe(
      'accessories/plugins/NodeNote.properties',
    );
    expect(child?.querySelector('hook > text')?.textContent).toBe('Old note');
  });

  test('does not log while loading a map', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    try {
      roundTrip('<map version="1.0.1"><node ID="ID_1" TEXT="Root"/></map>');
      expect(log).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });

  test('appends each element once when writing the XML', () => {
    const dom = new DOMParser().parseFromString(
      `<map version="1.0.1">
        <node ID="ID_1" TEXT="Root">
          <icon BUILTIN="idea"/>
          <node ID="ID_2" TEXT="Child" POSITION="right">
            <edge COLOR="#808080"/>
            <node ID="ID_3" TEXT="Grandchild"/>
          </node>
        </node>
      </map>`,
      'text/xml',
    );
    const map = new FreemindMap().loadFromDom(dom);
    const appendChild = jest.spyOn(Node.prototype, 'appendChild');
    try {
      const xml = map.toXml();

      const appended = appendChild.mock.calls.map(([child]) => (child as Element).tagName);
      expect(appended.sort()).toEqual(['edge', 'icon', 'map', 'node', 'node', 'node'].sort());
      expect(childTags(xml.querySelector('node[ID="ID_2"]'))).toEqual(['edge', 'node']);
    } finally {
      appendChild.mockRestore();
    }
  });

  test('skips children of an unknown type when writing the XML', () => {
    const root = new FreemindNode();
    root.setText('Root');
    const child = new FreemindNode();
    child.setText('Child');
    // A plain JavaScript object that none of the FreeMind element classes match.
    child.setArrowlinkOrCloudOrEdge({} as unknown as Choise);
    root.setArrowlinkOrCloudOrEdge(child);
    root.setArrowlinkOrCloudOrEdge({} as unknown as Choise);
    const map = new FreemindMap();
    map.setVesion('1.0.1');
    map.setNode(root);

    const xml = map.toXml();

    const mainNode = xml.querySelector('map > node');
    expect(childTags(mainNode)).toEqual(['node']);
    expect(childTags(mainNode?.querySelector(':scope > node') ?? null)).toEqual([]);
  });
});
