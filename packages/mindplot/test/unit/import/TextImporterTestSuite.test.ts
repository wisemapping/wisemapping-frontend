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

describe('package/', () => {
  test.each(testNames)('Importing %p suite', async (testName: string) => {
    const freemapPath = path.resolve(__dirname, `./input/${testName}.mm`);
    const mapContent = fs.readFileSync(freemapPath, { encoding: 'utf-8' }).toString();

    // Determine the file type based on content
    let fileType = 'mm';
    if (mapContent.includes('freeplane')) {
      fileType = 'mm'; // Freeplane uses .mm extension
    } else if (mapContent.includes('xmap-content')) {
      fileType = 'xmind';
    } else if (mapContent.includes('opml')) {
      fileType = 'opml';
    } else if (mapContent.includes('mindjet.com/MindManager')) {
      fileType = 'mmap';
    }

    // For FreeMind/Freeplane files, use the existing logic
    if (fileType === 'mm') {
      const mapDocument = parseXMLFile(freemapPath, 'text/xml');
      const freemap: FreemindMap = new FreemindMap().loadFromDom(mapDocument);
      const freemapXml = freemap.toXml();
      const freemapStr = new XMLSerializer().serializeToString(freemapXml);
      const importer = TextImporterFactory.create('mm', freemapStr);
      await exporterAssert(testName, importer);
    } else {
      // For other formats, use the raw content
      const importer = TextImporterFactory.create(fileType, mapContent);
      await exporterAssert(testName, importer);
    }
  });
});
