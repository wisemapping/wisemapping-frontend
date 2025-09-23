/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import fs from 'fs';
import { test } from '@jest/globals';
import { exporterAssert, parseXMLFile } from './Helper';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';

const testNames = fs
  .readdirSync(path.resolve(__dirname, './input/freeplane/'))
  .map((filename: string) => filename.split('.')[0]);

describe('Freeplane Importer Test Suite', () => {
  test.each(testNames)('Importing Freeplane %p suite', async (testName: string) => {
    // Load Freeplane map...
    const freeplanePath = path.resolve(__dirname, `./input/freeplane/${testName}.mm`);
    const mapDocument = parseXMLFile(freeplanePath, 'text/xml');
    const freeplaneStr = new XMLSerializer().serializeToString(mapDocument);

    const importer = TextImporterFactory.create('mmx', freeplaneStr);

    await exporterAssert(testName, importer);
  });
});
