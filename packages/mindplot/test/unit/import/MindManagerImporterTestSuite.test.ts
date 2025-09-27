/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import fs from 'fs';
import { test } from '@jest/globals';
import { exporterAssert } from './Helper';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';

const testNames = fs
  .readdirSync(path.resolve(__dirname, './input/mindmanager/'))
  .map((filename: string) => filename.split('.')[0]);

describe('MindManager Importer Test Suite', () => {
  test.each(testNames)('Importing MindManager %p suite', async (testName: string) => {
    // Load MindManager content...
    const mmapPath = path.resolve(__dirname, `./input/mindmanager/${testName}.mmap`);
    const mmapContent = fs.readFileSync(mmapPath, 'utf-8');

    const importer = TextImporterFactory.create('mmap', mmapContent);

    await exporterAssert(`mindmanager-${testName}`, importer);
  });
});
