/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import fs from 'fs';
import { test } from '@jest/globals';
import { exporterAssert, parseXMLFile } from './Helper';
import FreemindMap from '../../../src/components/export/freemind/Map';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';

const testNames = fs
  .readdirSync(path.resolve(__dirname, './input/'))
  .map((filename: string) => filename.split('.')[0]);

describe('MM import test execution', () => {
  test.each(testNames)('Importing %p suite', async (testName: string) => {
    // load freemap...
    const freemapPath = path.resolve(__dirname, `./input/${testName}.mm`);
    const mapDocument = parseXMLFile(freemapPath, 'text/xml');

    const freemap: FreemindMap = new FreemindMap().loadFromDom(mapDocument);
    const freemapXml = freemap.toXml();
    const freemapStr = new XMLSerializer().serializeToString(freemapXml);

    const importer = TextImporterFactory.create('mm', freemapStr);

    await exporterAssert(testName, importer);
  });
});
