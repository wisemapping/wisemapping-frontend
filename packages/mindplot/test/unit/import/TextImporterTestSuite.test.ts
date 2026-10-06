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

import path from 'path';
import fs from 'fs';
import { expect, test } from '@jest/globals';
import { exporterAssert, parseXMLFile } from './Helper';
import {
  freemindMapToXml,
  loadFreemindMap,
} from '../../../src/components/export/freemind/FreemindXml';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';
import ImportError from '../../../src/components/import/ImportError';

// Not a MindManager document (it has no Map element), so it can not be imported.
const notImportable = ['mindmanager'];

const testNames = fs
  .readdirSync(path.resolve(__dirname, './input/'))
  .filter((filename: string) => filename.endsWith('.mm'))
  .map((filename: string) => filename.split('.')[0]!);

describe('package/', () => {
  test.each(testNames)('Importing %p suite', async (testName: string) => {
    const freemapPath = path.resolve(__dirname, `./input/${testName}.mm`);
    const mapContent = fs.readFileSync(freemapPath, { encoding: 'utf-8' }).toString();

    // Determine the file type based on content; FreeMind and Freeplane maps both stay 'mm'.
    let fileType = 'mm';
    if (mapContent.includes('xmap-content')) {
      fileType = 'xmind';
    } else if (mapContent.includes('opml')) {
      fileType = 'opml';
    } else if (mapContent.includes('mindjet.com/MindManager')) {
      fileType = 'mmap';
    }

    // For FreeMind/Freeplane files, use the existing logic
    if (fileType === 'mm') {
      const mapDocument = parseXMLFile(freemapPath, 'text/xml');
      const freemapXml = freemindMapToXml(loadFreemindMap(mapDocument));
      const freemapStr = new XMLSerializer().serializeToString(freemapXml);
      const importer = TextImporterFactory.create('mm', freemapStr);
      await exporterAssert(testName, importer);
    } else {
      // For other formats, use the raw content
      const importer = TextImporterFactory.create(fileType, mapContent);
      if (notImportable.includes(testName)) {
        await expect(importer.import(testName, '')).rejects.toBeInstanceOf(ImportError);
      } else {
        await exporterAssert(testName, importer);
      }
    }
  });
});
