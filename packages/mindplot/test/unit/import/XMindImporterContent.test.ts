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
import { strToU8, zipSync } from 'fflate';
import XMindImporter from '../../../src/components/import/XMindImporter';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';

const loadMindmap = (xml: string): Mindmap => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return XMLSerializerFactory.createFromDocument(doc).loadFromDom(doc, 'test');
};

const allNodes = (node: NodeModel): NodeModel[] => [node, ...node.getChildren().flatMap(allNodes)];

const findByText = (mindmap: Mindmap, text: string): NodeModel => {
  const result = mindmap
    .getBranches()
    .flatMap(allNodes)
    .find((node) => node.getText() === text);
  if (!result) {
    throw new Error(`Topic ${text} not found`);
  }
  return result;
};

const noteOf = (node: NodeModel): string => node.findFeatureByType('note').at(0)?.getText() ?? '';

const iconsOf = (node: NodeModel): string[] =>
  node.findFeatureByType('eicon').map((icon) => icon.getIconType());

const linkOf = (node: NodeModel): string | undefined =>
  node.findFeatureByType('link').at(0)?.getUrl();

describe('XMindImporter (JSON format) content', () => {
  const sheet = {
    id: 'sheet1',
    class: 'sheet',
    rootTopic: {
      id: 'root',
      title: 'Root',
      children: {
        attached: [
          {
            id: 'a',
            title: 'Attached',
            notes: { plain: { content: 'The note of A' } },
            markers: [{ markerId: 'priority-1' }, { markerId: 'task-done' }],
          },
        ],
        detached: [
          {
            id: 'f',
            title: 'Floating',
            position: { x: -438, y: -87.5 },
            notes: { plain: { content: 'The note of F' } },
            children: { attached: [{ id: 'fc', title: 'Floating child' }] },
          },
        ],
      },
    },
    relationships: [{ id: 'r1', end1Id: 'a', end2Id: 'f' }],
  };

  const importSheet = async (): Promise<Mindmap> =>
    loadMindmap(await new XMindImporter(JSON.stringify([sheet])).import('test'));

  test('imports detached topics as floating topics with their children', async () => {
    const mindmap = await importSheet();

    const branches = mindmap.getBranches();
    expect(branches).toHaveLength(2);
    expect(branches[0]!.getType()).toBe('CentralTopic');

    const floating = branches[1]!;
    expect(floating.getType()).toBe('MainTopic');
    expect(floating.getText()).toBe('Floating');
    expect(floating.getPosition()).toEqual({ x: -438, y: -87 });
    expect(floating.getChildren().map((c) => c.getText())).toEqual(['Floating child']);
  });

  test('keeps relationships that point to a detached topic', async () => {
    const mindmap = await importSheet();

    const relationships = mindmap.getRelationships();
    expect(relationships).toHaveLength(1);
    expect(relationships[0]!.getFromNode()).toBe(findByText(mindmap, 'Attached').getId());
    expect(relationships[0]!.getToNode()).toBe(findByText(mindmap, 'Floating').getId());
  });

  test('imports notes.plain.content as the topic note', async () => {
    const mindmap = await importSheet();

    expect(noteOf(findByText(mindmap, 'Attached'))).toContain('The note of A');
    expect(noteOf(findByText(mindmap, 'Floating'))).toContain('The note of F');
  });

  test('imports Zen markers as icons', async () => {
    const mindmap = await importSheet();

    expect(iconsOf(findByText(mindmap, 'Attached'))).toEqual(['🔴', '✅']);
  });
});

describe('XMindImporter (XML format) content', () => {
  test('imports detached topics as floating topics', async () => {
    const xmind = `<?xml version="1.0" encoding="UTF-8"?>
<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" xmlns:svg="http://www.w3.org/2000/svg" version="2.0">
  <sheet id="sheet1">
    <topic id="root">
      <title>Root</title>
      <children>
        <topics type="attached">
          <topic id="a"><title>Attached</title></topic>
        </topics>
        <topics type="detached">
          <topic id="f">
            <title>Floating</title>
            <position svg:x="120" svg:y="-80"/>
          </topic>
        </topics>
      </children>
    </topic>
    <relationships>
      <relationship id="r1" end1="a" end2="f"/>
    </relationships>
  </sheet>
</xmap-content>`;

    const mindmap = loadMindmap(await new XMindImporter(xmind).import('test'));

    const branches = mindmap.getBranches();
    expect(branches).toHaveLength(2);
    expect(branches[1]!.getText()).toBe('Floating');
    expect(branches[1]!.getPosition()).toEqual({ x: 120, y: -80 });
    expect(mindmap.getRelationships()).toHaveLength(1);
  });
});

describe('XMindImporter central topic and links (JSON format)', () => {
  const sheet = {
    id: 'sheet1',
    class: 'sheet',
    rootTopic: {
      id: 'root',
      title: 'Root',
      href: 'https://example.com/root',
      notes: { plain: { content: 'The note of the root' } },
      markers: [{ markerId: 'priority-1' }],
      children: {
        attached: [
          { id: 'a', title: 'Linked', href: 'https://example.com/a' },
          { id: 'b', title: 'Topic link', href: 'xmind:#a' },
          { id: 'c', title: 'Attachment', href: 'xap:attachments/file.pdf' },
        ],
      },
    },
  };

  const importSheet = async (): Promise<Mindmap> =>
    loadMindmap(await new XMindImporter(JSON.stringify([sheet])).import('test'));

  test('imports the notes, icons and link of the central topic', async () => {
    const central = findByText(await importSheet(), 'Root');

    expect(noteOf(central)).toContain('The note of the root');
    expect(iconsOf(central)).toEqual(['🔴']);
    expect(linkOf(central)).toBe('https://example.com/root');
  });

  test('imports href as a link, except links to topics and attachments of the file', async () => {
    const mindmap = await importSheet();

    expect(linkOf(findByText(mindmap, 'Linked'))).toBe('https://example.com/a');
    expect(linkOf(findByText(mindmap, 'Topic link'))).toBeUndefined();
    expect(linkOf(findByText(mindmap, 'Attachment'))).toBeUndefined();
  });
});

describe('XMindImporter central topic and links (XML format)', () => {
  const xmind = `<?xml version="1.0" encoding="UTF-8"?>
<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" xmlns:xlink="http://www.w3.org/1999/xlink" version="2.0">
  <sheet id="sheet1">
    <topic id="root" xlink:href="https://example.com/root">
      <title>Root</title>
      <notes><plain>The note of the root</plain></notes>
      <marker-refs><marker-ref marker-id="priority-1"/></marker-refs>
      <children>
        <topics type="attached">
          <topic id="a" xlink:href="https://example.com/a"><title>Linked</title></topic>
          <topic id="b" xlink:href="xmind:#a"><title>Topic link</title></topic>
        </topics>
      </children>
    </topic>
  </sheet>
</xmap-content>`;

  test('imports the notes, icons and link of the central topic', async () => {
    const central = findByText(loadMindmap(await new XMindImporter(xmind).import('test')), 'Root');

    expect(noteOf(central)).toContain('The note of the root');
    expect(iconsOf(central)).toEqual(['🔴']);
    expect(linkOf(central)).toBe('https://example.com/root');
  });

  test('imports xlink:href as a link, except links to topics of the file', async () => {
    const mindmap = loadMindmap(await new XMindImporter(xmind).import('test'));

    expect(linkOf(findByText(mindmap, 'Linked'))).toBe('https://example.com/a');
    expect(linkOf(findByText(mindmap, 'Topic link'))).toBeUndefined();
  });
});

describe('XMindImporter (XML format) security', () => {
  // Billion laughs: each entity expands to ten of the previous one.
  const entityBomb = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmap-content [
  <!ENTITY lol "lol">
  <!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
  <!ENTITY lol2 "&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;">
  <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
]>
<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" version="2.0">
  <sheet id="sheet1">
    <topic id="root"><title>&lol3;</title></topic>
  </sheet>
</xmap-content>`;

  test('rejects a content.xml declaring entities, as every other importer does', async () => {
    const archive = zipSync({ 'content.xml': strToU8(entityBomb) });

    await expect(new XMindImporter(archive).import('test')).rejects.toThrow(/unsafe/);
  });

  test('rejects a plain XML document declaring entities', async () => {
    await expect(new XMindImporter(entityBomb).import('test')).rejects.toThrow(/unsafe/);
  });
});
