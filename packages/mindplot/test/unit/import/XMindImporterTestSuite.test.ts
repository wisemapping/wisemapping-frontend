/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import fs from 'fs';
import { test } from '@jest/globals';
import { exporterAssert } from './Helper';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';

const testNames = fs
  .readdirSync(path.resolve(__dirname, './input/xmind/'))
  .map((filename: string) => filename.split('.')[0]);

describe('XMind Importer Test Suite', () => {
  test.each(testNames)('Importing XMind %p suite', async (testName: string) => {
    // Load XMind content...
    const xmindPath = path.resolve(__dirname, `./input/xmind/${testName}.xmind`);
    const xmindContent = fs.readFileSync(xmindPath, 'utf-8');

    const importer = TextImporterFactory.create('xmind', xmindContent);

    await exporterAssert(testName, importer);
  });
});
