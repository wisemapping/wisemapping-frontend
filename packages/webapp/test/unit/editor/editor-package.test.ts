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

// Loads the real @wisemapping/editor (mapped to its sources in jest.config.js). Its mindplot
// dependency lists the icons with Vite's import.meta.glob and pulls in jspdf, which uses the
// Encoding API: neither works under jest/jsdom without the harness's help.
import { TextImporterFactory, XMLSerializerFactory } from '@wisemapping/editor';

const WXML =
  '<map name="map" version="tango"><topic central="true" text="Central" id="1">' +
  '<topic position="200,0" order="0" text="Child" id="2"/></topic></map>';

describe('@wisemapping/editor', () => {
  test('imports a WiseMapping map', async () => {
    const content = await TextImporterFactory.create('wxml', WXML).import('Imported', 'desc');

    const document = new DOMParser().parseFromString(content, 'text/xml');
    const mindmap = XMLSerializerFactory.createFromDocument(document).loadFromDom(
      document,
      'Imported',
    );
    expect(mindmap.getBranches()[0].getText()).toBe('Central');
    expect(mindmap.getBranches()[0].getChildren()[0].getText()).toBe('Child');
  });
});
