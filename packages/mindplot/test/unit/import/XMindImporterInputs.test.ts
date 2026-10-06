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
import { strToU8, zipSync } from 'fflate';
import XMindImporter from '../../../src/components/import/XMindImporter';
import type Mindmap from '../../../src/components/model/Mindmap';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';

/** The ways an XMind file reaches the importer: XML, JSON, a ZIP, as text or as bytes. */

const load = (xml: string): Mindmap => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return XMLSerializerFactory.createFromDocument(doc).loadFromDom(doc, 'test');
};

const importMap = async (input: ConstructorParameters<typeof XMindImporter>[0]) =>
  load(await new XMindImporter(input).import('imported'));

const centralText = (mindmap: Mindmap) => mindmap.getCentralTopic()!.getText();
const childTexts = (mindmap: Mindmap) =>
  mindmap
    .getCentralTopic()!
    .getChildren()
    .map((child) => child.getText());

const sheet = (rootTopic: object, extra: object = {}) => ({
  id: 's',
  class: 'sheet',
  rootTopic: { id: 'r', title: 'Root', ...rootTopic },
  ...extra,
});

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" version="2.0">
  <sheet id="s"><topic id="r"><title>Root</title>
    <children><topics type="attached"><topic id="a"><title>A</title></topic></topics></children>
  </topic></sheet>
</xmap-content>`;

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('XMindImporter inputs', () => {
  it('reads XML given as text or as bytes', async () => {
    expect(childTexts(await importMap(XML))).toEqual(['A']);
    expect(childTexts(await importMap(strToU8(XML)))).toEqual(['A']);
    expect(childTexts(await importMap(strToU8(XML).buffer))).toEqual(['A']);
  });

  it('reads JSON given as a sheet, a list of sheets or an object with sheets', async () => {
    const one = sheet({ children: { attached: [{ id: 'a', title: 'A' }] } });
    expect(childTexts(await importMap(JSON.stringify(one)))).toEqual(['A']);
    expect(centralText(await importMap(JSON.stringify([{ id: 'x' }, one])))).toBe('Root');
    expect(centralText(await importMap(JSON.stringify({ sheets: [one] })))).toBe('Root');
    expect(centralText(await importMap(strToU8(JSON.stringify(one))))).toBe('Root');
  });

  it('picks the first sheet with a root topic when none is marked as a sheet', async () => {
    const plain = { id: 's', rootTopic: { id: 'r', title: 'Plain' } };
    expect(centralText(await importMap(JSON.stringify([plain])))).toBe('Plain');
  });

  it('rejects JSON without a root topic', async () => {
    await expect(importMap(JSON.stringify({ sheets: [{ id: 's' }] }))).rejects.toThrow(
      'root topic not found',
    );
    await expect(importMap(JSON.stringify([]))).rejects.toThrow('root topic not found');
  });

  it('reads the content.json or content.xml of a ZIP, given as bytes or as a binary string', async () => {
    const jsonZip = zipSync({ 'content.json': strToU8(JSON.stringify([sheet({})])) });
    expect(centralText(await importMap(jsonZip))).toBe('Root');

    const xmlZip = zipSync({ 'content.xml': strToU8(XML) });
    const binary = Array.from(xmlZip, (byte) => String.fromCharCode(byte)).join('');
    expect(childTexts(await importMap(binary))).toEqual(['A']);
  });

  it('rejects a ZIP without content, an empty payload and unknown text', async () => {
    await expect(importMap(zipSync({ 'other.txt': strToU8('x') }))).rejects.toThrow(
      'missing content.json or content.xml',
    );
    await expect(importMap(new Uint8Array(0))).rejects.toThrow('Empty XMind ZIP payload');
    await expect(importMap('not a map')).rejects.toThrow('Unsupported XMind input');
  });

  it('rejects XML without a topic', async () => {
    await expect(
      importMap('<?xml version="1.0"?><xmap-content><sheet id="s"/></xmap-content>'),
    ).rejects.toThrow('No root topic found');
  });
});

describe('XMindImporter layout', () => {
  it.each([
    ['org.xmind.ui.org-chart.down', 'tree'],
    ['org.xmind.ui.logic.right', 'tree'],
    ['org.xmind.ui.map.clockwise', 'mindmap'],
    ['org.xmind.ui.spreadsheet', 'mindmap'],
  ])('maps the structure %s of the root topic to the %s layout', async (structure, layout) => {
    const mindmap = await importMap(JSON.stringify(sheet({ structureClass: structure })));
    expect(mindmap.getLayout()).toBe(layout);
  });

  it('reads the structure from the sheet extensions when the root topic has none', async () => {
    const withExtensions = sheet(
      {},
      {
        extensions: [
          { provider: 'other', content: {} },
          { provider: 'skeleton', content: { centralTopic: 'org.xmind.ui.tree.right' } },
        ],
      },
    );
    expect((await importMap(JSON.stringify(withExtensions))).getLayout()).toBe('tree');
  });

  it('maps the structure of an XML root topic', async () => {
    const tree = XML.replace(
      '<topic id="r">',
      '<topic id="r" structure-class="org.xmind.ui.fishbone">',
    );
    expect((await importMap(tree)).getLayout()).toBe('tree');
  });
});
