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
import { expect, test } from '@jest/globals'; // Workaround for cypress conflict
import SVGExporter from '../../../src/components/export/SVGExporter';
import { parseXMLFile, setupBlob, exporterAssert } from './Helper';

setupBlob();

describe('SVG export test execution', () => {
  test.each(
    fs
      .readdirSync(path.resolve(__dirname, './input/'))
      .filter((f) => f.endsWith('.wxml'))
      .map((filename: string) => filename.split('.')[0]),
  )('Exporting %p suite', async (testName: string) => {
    // Load SVG ...
    const svgPath = path.resolve(__dirname, `./input/${testName}.svg`);
    expect(fs.existsSync(svgPath)).toEqual(true);
    const svgDocument = parseXMLFile(svgPath, 'image/svg+xml');

    // Generate output ...
    const exporter = new SVGExporter(svgDocument.documentElement);
    await exporterAssert(testName, exporter);
  });
});
