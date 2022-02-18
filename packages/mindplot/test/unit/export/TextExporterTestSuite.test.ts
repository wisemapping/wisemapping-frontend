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
    const serializer = XMLSerializerFactory.createInstanceFromDocument(mapDocument);
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
    const serializer = XMLSerializerFactory.createInstanceFromDocument(mapDocument);
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
    const serializer = XMLSerializerFactory.createInstanceFromDocument(mapDocument);
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
    const serializer = XMLSerializerFactory.createInstanceFromDocument(mapDocument);
    const mindmap: Mindmap = serializer.loadFromDom(mapDocument, testName);

    const exporter = TextExporterFactory.create('mm', mindmap);
    await exporterAssert(testName, exporter);
  });
});
