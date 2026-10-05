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
import OPMLImporter from '../../../src/components/import/OPMLImporter';
import ImportError from '../../../src/components/import/ImportError';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';

const loadMindmap = (xml: string) => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return XMLSerializerFactory.createFromDocument(doc).loadFromDom(doc, 'test');
};

describe('OPMLImporter', () => {
  test('imports an OPML 1.0 outline as a WiseMapping map', async () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
      <opml version="1.0">
        <head><title>Test</title></head>
        <body>
          <outline text="Central">
            <outline text="Child 1"/>
            <outline text="Child 2"/>
          </outline>
        </body>
      </opml>`;

    const xml = await new OPMLImporter(opml).import('test');

    const mindmap = loadMindmap(xml);
    const central = mindmap.getCentralTopic();
    expect(central.getText()).toBe('Central');
    expect(central.getChildren().map((c) => c.getText())).toEqual(['Child 1', 'Child 2']);
  });

  test('rejects with an ImportError when the OPML cannot be parsed', async () => {
    const result = new OPMLImporter('<opml><body><outline').import('test & "map"');

    await expect(result).rejects.toBeInstanceOf(ImportError);
  });

  test('imports every top-level outline under a central topic named after the OPML title', async () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
      <opml version="1.0">
        <head><title>OPML Root</title></head>
        <body>
          <outline text="Child 1"><outline text="Grandchild"/></outline>
          <outline text="Child 2"/>
        </body>
      </opml>`;

    const xml = await new OPMLImporter(opml).import('test');

    const central = loadMindmap(xml).getCentralTopic();
    expect(central.getText()).toBe('OPML Root');
    expect(central.getChildren().map((c) => c.getText())).toEqual(['Child 1', 'Child 2']);
    expect(
      central
        .getChildren()[0]
        .getChildren()
        .map((c) => c.getText()),
    ).toEqual(['Grandchild']);
  });

  test('names the central topic after the map when the OPML has no title', async () => {
    const opml =
      '<opml version="2.0"><head/><body><outline text="A"/><outline text="B"/></body></opml>';

    const xml = await new OPMLImporter(opml).import('My map');

    const central = loadMindmap(xml).getCentralTopic();
    expect(central.getText()).toBe('My map');
    expect(central.getChildren().map((c) => c.getText())).toEqual(['A', 'B']);
  });
});
