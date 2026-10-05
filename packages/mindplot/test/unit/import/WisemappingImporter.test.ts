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
import WisemappingImporter from '../../../src/components/import/WisemappingImporter';
import ImportError from '../../../src/components/import/ImportError';

describe('WisemappingImporter', () => {
  test('imports a WiseMapping map', async () => {
    const wxml = '<map name="1" version="tango"><topic central="true" text="Root" id="1"/></map>';

    const xml = await new WisemappingImporter(wxml).import('test', 'description');
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.querySelector('topic[central="true"]')?.getAttribute('text')).toBe('Root');
  });

  test('rejects a file that can not be imported with an ImportError instead of throwing', async () => {
    let result: Promise<string> | undefined;
    expect(() => {
      result = new WisemappingImporter('<map><topic text="unclosed"').import('test', '');
    }).not.toThrow();
    await expect(result).rejects.toBeInstanceOf(ImportError);
    await expect(result).rejects.toThrow(/WiseMapping/);
  });
});
