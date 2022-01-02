import Mindmap from '../../../src/components/model/Mindmap';
import path from 'path';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import TextExporterFactory from '../../../src/components/export/TextExporterFactory';
import { parseXMLFile, setupBlob, exporterAssert } from './Helper';
import fs from 'fs';
import { test, expect } from '@jest/globals'; // Workaround for cypress conflict

setupBlob();

describe('WXML export test execution', () => {
  test.each(fs.readdirSync(path.resolve(__dirname, './input/'))
    .filter((f) => f.endsWith('.wxml'))
    .map((filename: string) => filename.split('.')[0]))
    (`Exporting %p suite`, async (testName: string) => {
      // Load mindmap DOM ...
      const mindmapPath = path.resolve(__dirname, `./input/${testName}.wxml`);
      const mapDocument = parseXMLFile(mindmapPath, 'text/xml');

      // Convert to mindmap ...
      const serializer = XMLSerializerFactory.createInstanceFromDocument(mapDocument);
      const mindmap: Mindmap = serializer.loadFromDom(mapDocument, testName);

      const exporter = TextExporterFactory.create('wxml', mindmap);
      await exporterAssert(testName, exporter);
    });
  });

  describe('Txt export test execution', () => {
    test.each(fs.readdirSync(path.resolve(__dirname, './input/'))
      .filter((f) => f.endsWith('.wxml'))
      .map((filename: string) => filename.split('.')[0]))
      (`Exporting %p suite`, async (testName: string) => {
        // Load mindmap DOM ...
        const mindmapPath = path.resolve(__dirname, `./input/${testName}.wxml`);
        const mapDocument = parseXMLFile(mindmapPath, 'text/xml');
  
        // Convert to mindmap ...
        const serializer = XMLSerializerFactory.createInstanceFromDocument(mapDocument);
        const mindmap: Mindmap = serializer.loadFromDom(mapDocument, testName);
  
        const exporter = TextExporterFactory.create('txt', mindmap);
        await exporterAssert(testName, exporter);
      });
});      