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
import path from 'path';
import fs from 'fs';
import { test } from '@jest/globals';
import { exporterAssert } from './Helper';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';

const testNames = fs
  .readdirSync(path.resolve(__dirname, './input/opml/'))
  .map((filename: string) => filename.split('.')[0]);

describe('OPML Importer Test Suite', () => {
  test.each(testNames)('Importing OPML %p suite', async (testName: string) => {
    // Load OPML content...
    const opmlPath = path.resolve(__dirname, `./input/opml/${testName}.opml`);
    const opmlContent = fs.readFileSync(opmlPath, 'utf-8');

    const importer = TextImporterFactory.create('opml', opmlContent);

    await exporterAssert(`opml-${testName}`, importer);
  });
});
