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
/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import path from 'path';
import { expect } from '@jest/globals';
import { diff } from 'jest-diff';
import Importer from '../../../src/components/import/Importer';

const saveOutputRecord = false;

export const parseXMLString = (xmlStr: string, mimeType: DOMParserSupportedType) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlStr, mimeType);

  return xmlDoc;
};

export const parseXMLFile = (
  filePath: fs.PathOrFileDescriptor,
  mimeType: DOMParserSupportedType,
) => {
  const stream = fs.readFileSync(filePath, { encoding: 'utf-8' });

  const content = stream.toString();

  return parseXMLString(content, mimeType);
};

export const exporterAssert = async (testName: string, importer: Importer) => {
  const actualMindmap = await importer.import(testName, '');

  // Load mindmap file..
  const mindmapPath = path.resolve(__dirname, `./expected/${testName}.wxml`);
  if (saveOutputRecord) {
    fs.writeFileSync(mindmapPath, actualMindmap);
  }

  const mindmapExpect = fs.readFileSync(mindmapPath).toString();

  // Compare with expected...
  if (actualMindmap !== mindmapExpect) {
    const diffResult = diff(actualMindmap, mindmapExpect);
    console.log(diffResult);
    expect(actualMindmap).toEqual(mindmapExpect);
  }
};
