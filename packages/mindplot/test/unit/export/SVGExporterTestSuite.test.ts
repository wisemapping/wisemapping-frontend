import path from 'path';
import fs from 'fs';
import { expect, test } from '@jest/globals'; // Workaround for cypress conflict
import Mindmap from '../../../src/components/model/Mindmap';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import SVGExporter from '../../../src/components/export/SVGExporter';
import { parseXMLFile, setupBlob, exporterAssert } from './Helper';

setupBlob();

describe('SVG export test execution', () => {
  test.each(fs.readdirSync(path.resolve(__dirname, './input/'))
    .filter((f) => f.endsWith('.wxml'))
    .map((filename: string) => filename.split('.')[0]))('Exporting %p suite', async (testName: string) => {
    // Load mindmap DOM ...
    const mindmapPath = path.resolve(__dirname, `./input/${testName}.wxml`);
    const mapDocument = parseXMLFile(mindmapPath, 'text/xml');

    // Convert to mindmap ...
    const serializer = XMLSerializerFactory.createInstanceFromDocument(mapDocument);
    const mindmap: Mindmap = serializer.loadFromDom(mapDocument, testName);

    // Load SVG ...
    const svgPath = path.resolve(__dirname, `./input/${testName}.svg`);
    expect(fs.existsSync(svgPath)).toEqual(true);
    const svgDocument = parseXMLFile(svgPath, 'image/svg+xml');

    // Generate output ...
    const exporter = new SVGExporter(svgDocument.documentElement);
    await exporterAssert(testName, exporter);
  });
});
