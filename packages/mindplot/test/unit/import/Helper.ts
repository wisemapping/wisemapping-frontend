/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import path from 'path';
import { expect } from '@jest/globals';
import Importer from '../../../src/components/import/Importer';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import { parseXMLFile } from '../export/Helper';

export const exporterAssert = async (testName: string, importer: Importer) => {
  const actualMindmap = await importer.import(testName, '');

  // Load mindmap DOM..
  const mindmapPath = path.resolve(__dirname, `./expected/${testName}.wxml`);
  const mindmapMapDocument = parseXMLFile(mindmapPath, 'text/xml');

  // Convert to mindmap...
  const serializer = XMLSerializerFactory.createInstanceFromDocument(mindmapMapDocument);
  const mindmapExpect = serializer.loadFromDom(mindmapMapDocument, testName);

  expect(actualMindmap).toEqual(mindmapExpect);
};
