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
