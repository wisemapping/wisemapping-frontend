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
import { test } from '@jest/globals'; // Workaround for cypress conflict
import Mindmap from '../../../src/components/model/Mindmap';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import TextExporterFactory from '../../../src/components/export/TextExporterFactory';
import { parseXMLFile, setupBlob, exporterAssert } from './Helper';

setupBlob();

const testNames = fs
  .readdirSync(path.resolve(__dirname, './input/'))
  .filter((f) => f.endsWith('.wxml'))
  .map((filename: string) => filename.split('.')[0]);

describe('WXML export test execution', () => {
  test.each(testNames)('Exporting %p suite', async (testName: string) => {
    // Load mindmap DOM ...
    const mindmapPath = path.resolve(__dirname, `./input/${testName}.wxml`);
    const mapDocument = parseXMLFile(mindmapPath, 'text/xml');

    // Convert to mindmap ...
    const serializer = XMLSerializerFactory.createFromDocument(mapDocument);
    const mindmap: Mindmap = serializer.loadFromDom(mapDocument, testName);

    const exporter = TextExporterFactory.create('wxml', mindmap);
    await exporterAssert(testName, exporter);
  });
});

describe('Txt export test execution', () => {
  test.each(testNames)('Exporting %p suite', async (testName: string) => {
    // Load mindmap DOM ...
    const mindmapPath = path.resolve(__dirname, `./input/${testName}.wxml`);
    const mapDocument = parseXMLFile(mindmapPath, 'text/xml');

    // Convert to mindmap ...
    const serializer = XMLSerializerFactory.createFromDocument(mapDocument);
    const mindmap: Mindmap = serializer.loadFromDom(mapDocument, testName);

    const exporter = TextExporterFactory.create('txt', mindmap);
    await exporterAssert(testName, exporter);
  });
});

describe('MD export test execution', () => {
  test.each(testNames)('Exporting %p suite', async (testName: string) => {
    // Load mindmap DOM ...
    const mindmapPath = path.resolve(__dirname, `./input/${testName}.wxml`);
    const mapDocument = parseXMLFile(mindmapPath, 'text/xml');

    // Convert to mindmap ...
    const serializer = XMLSerializerFactory.createFromDocument(mapDocument);
    const mindmap: Mindmap = serializer.loadFromDom(mapDocument, testName);

    const exporter = TextExporterFactory.create('md', mindmap);
    await exporterAssert(testName, exporter);
  });
});

describe('MM export test execution', () => {
  test.each(testNames)('Exporting %p suite', async (testName: string) => {
    // Load mindmap DOM..
    const mindmapPath = path.resolve(__dirname, `./input/${testName}.wxml`);
    const mapDocument = parseXMLFile(mindmapPath, 'text/xml');

    // Convert to mindmap...
    const serializer = XMLSerializerFactory.createFromDocument(mapDocument);
    const mindmap: Mindmap = serializer.loadFromDom(mapDocument, testName);

    const exporter = TextExporterFactory.create('mm', mindmap);
    await exporterAssert(testName, exporter);
  });
});
