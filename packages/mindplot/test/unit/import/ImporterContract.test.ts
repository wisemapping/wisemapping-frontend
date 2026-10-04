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
import { describe, expect, test } from '@jest/globals';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';

// A file that can not be imported must reject with an ImportError. It must never resolve to a
// placeholder map, because the caller can not tell it from a successful import and saves it.

const BROKEN = '<map><node TEXT="unclosed"';

describe('Importer contract', () => {
  test.each(['wxml', 'mm', 'mmx', 'xmind', 'mmap', 'opml'])(
    '%p rejects with an ImportError when the file can not be imported',
    async (type: string) => {
      const importer = TextImporterFactory.create(type, BROKEN);

      const result = importer.import('test', '');

      await expect(result).rejects.toMatchObject({ name: 'ImportError' });
      await expect(result).rejects.toThrow(/\S/);
    },
  );

  test('a FreeMind map of an unsupported version rejects instead of throwing synchronously', async () => {
    const importer = TextImporterFactory.create(
      'mm',
      '<map version="1.1.0"><node ID="ID_1" TEXT="Root"/></map>',
    );

    let result: Promise<string> | undefined;
    expect(() => {
      result = importer.import('test', '');
    }).not.toThrow();
    await expect(result).rejects.toMatchObject({
      name: 'ImportError',
      message: expect.stringContaining('FreeMind version 1.1.0 is not supported.'),
    });
  });
});
