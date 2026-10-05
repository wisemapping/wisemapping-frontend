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
import XMindImporter from '../../../src/components/import/XMindImporter';

// The names of the properties every plain object inherits from Object.prototype.
const INHERITED = ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__'];

// The eicon ids of the map written by an import.
const importedIcons = async (importer: { import: (name: string) => Promise<string> }) => {
  const xml = await importer.import('icons');
  return Array.from(xml.matchAll(/<eicon id="([^"]*)"/g)).map((match) => match[1]);
};

describe('icon tables only map their own entries, not the Object.prototype properties', () => {
  test.each(INHERITED)('Freeplane icon %p', async (name) => {
    const freeplane = `<map version="freeplane 1.9.13">
      <node TEXT="Root" ID="ID_1"><icon BUILTIN="${name}"/></node>
    </map>`;

    const icons = await importedIcons(new FreeplaneImporter(freeplane));

    expect(icons).toEqual(['💡']);
  });

  test.each(INHERITED)('XMind marker %p', async (name) => {
    const xmind = `<?xml version="1.0" encoding="UTF-8"?>
      <xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0">
        <sheet id="s1"><topic id="t1"><title>Root</title>
          <marker-refs><marker-ref marker-id="${name}"/></marker-refs>
        </topic></sheet>
      </xmap-content>`;

    const icons = await importedIcons(new XMindImporter(xmind));

    expect(icons).toEqual(['💡']);
  });

  test.each(INHERITED)('MindManager icon %p', async (name) => {
    const mindManager = `<ap:Map xmlns:ap="http://schemas.mindjet.com/MindManager/Application/2003">
      <ap:OneTopic><ap:Topic OId="t1"><ap:Text PlainText="Root"/>
        <ap:IconsGroup><ap:Icons><ap:Icon IconType="urn:mindjet:${name}"/></ap:Icons></ap:IconsGroup>
      </ap:Topic></ap:OneTopic>
    </ap:Map>`;

    const icons = await importedIcons(new MindManagerImporter(mindManager));

    // MindManager skips the icons it does not know.
    expect(icons).toEqual([]);
  });
});
