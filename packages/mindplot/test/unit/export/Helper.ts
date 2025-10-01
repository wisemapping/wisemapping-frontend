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
import { Blob } from 'blob-polyfill';
import path from 'path';
import fs from 'fs';
import { diff } from 'jest-diff';
import { expect } from '@jest/globals';
import Exporter from '../../../src/components/export/Exporter';

const saveOutputRecord = true;

export const setupBlob = () => {
  // Workaround for partial implementations on Jest:
  // 1) Blob is not supported by jest (https://stackoverflow.com/questions/69135061/jest-test-creates-empty-blob-object
  globalThis.Blob = Blob;

  // 2) URL partially supported ...
  if (typeof window.URL.createObjectURL === 'undefined') {
    Object.defineProperty(window.URL, 'createObjectURL', { value: (param: Blob) => param.text() });
  }
};

export const parseXMLString = (xmlStr: string, mimeType: DOMParserSupportedType) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlStr, mimeType);

  // Is there any parsing error ?.
  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    const xmmStr = new XMLSerializer().serializeToString(xmlDoc);
    console.log(xmmStr);
    throw new Error(`Unexpected error parsing: ${xmlStr}. Error: ${xmmStr}`);
  }

  return xmlDoc;
};

export const parseXMLFile = (
  filePath: fs.PathOrFileDescriptor,
  mimeType: DOMParserSupportedType,
) => {
  const stream = fs.readFileSync(filePath, { encoding: 'utf-8' });

  let content = stream.toString();
  // Hack for SVG exported from the browser ...
  if (mimeType === 'image/svg+xml') {
    content = content.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');
  }

  return parseXMLString(content, mimeType);
};

export const exporterAssert = async (testName: string, exporter: Exporter) => {
  const actualStr = await exporter.export();

  // Compared with expected ...
  const expectedPath = path.resolve(__dirname, `./expected/${testName}.${exporter.extension()}`);
  if (saveOutputRecord) {
    fs.writeFileSync(expectedPath, actualStr);
  }

  // compare with expected ...
  const expectedStr = fs.readFileSync(expectedPath).toString();
  if (actualStr !== expectedStr) {
    const diffResult = diff(actualStr, expectedStr);
    console.log(diffResult);
    expect(actualStr).toEqual(expectedStr);
  }
};
