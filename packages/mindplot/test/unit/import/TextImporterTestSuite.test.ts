import path from 'path';
import fs from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@jest/globals';
import { parseXMLFile } from '../export/Helper';
import FreemindMap from '../../../src/components/export/freemind/Map';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import Mindmap from '../../../src/components/model/Mindmap';

const testNames = fs
  .readdirSync(path.resolve(__dirname, './input/'))
  .map((filename: string) => filename.split('.')[0]);

describe('MMa import test execution', () => {
  test.each(testNames)('Importing %p suite', async (testName: string) => {
    // load freemap...
    const freemapPath = path.resolve(__dirname, `./input/${testName}.mm`);
    const mapDocument = parseXMLFile(freemapPath, 'text/xml');

    const freemap: FreemindMap = new FreemindMap().loadFromDom(mapDocument);

    // Load mindmap DOM..
    const mindmapPath = path.resolve(__dirname, `./expected/${testName}.wxml`);
    const mindmapMapDocument = parseXMLFile(mindmapPath, 'text/xml');

    // Convert to mindmap...
    const serializer = XMLSerializerFactory.createInstanceFromDocument(mindmapMapDocument);
    const mindmap: Mindmap = serializer.loadFromDom(mapDocument, testName);

    const importer = TextImporterFactory.create('mm', freemap);
    const mindmapImport: Mindmap = await importer.import(testName, '');

    expect(mindmapImport).toStrictEqual(mindmap);
  });
});
