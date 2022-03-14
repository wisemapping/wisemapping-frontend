/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import path from 'path';
import { expect } from '@jest/globals';
import { diff } from 'jest-diff';
import Importer from '../../../src/components/import/Importer';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import { parseXMLFile } from '../export/Helper';

export const exporterAssert = async (testName: string, importer: Importer) => {
  const actualMindmap = await importer.import(testName, '');

  // Load mindmap DOM..
  const mindmapPath = path.resolve(__dirname, `./expected/${testName}.wxml`);
  const mindmapDocument = parseXMLFile(mindmapPath, 'text/xml');
  const serializer = XMLSerializerFactory.createInstanceFromDocument(mindmapDocument);
  const mindmapExpect = serializer.loadFromDom(mindmapDocument, testName);

  // Compare with expected...
  if (actualMindmap !== mindmapExpect) {
    const diffResult = diff(actualMindmap, mindmapExpect);
    console.log(diffResult);
    expect(actualMindmap).toEqual(mindmapExpect);
  }
};
