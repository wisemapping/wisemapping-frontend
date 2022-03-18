/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import path from 'path';
import { expect } from '@jest/globals';
import { diff } from 'jest-diff';
import Importer from '../../../src/components/import/Importer';

const saveOutputRecord = false;

export const parseXMLString = (xmlStr: string, mimeType: DOMParserSupportedType) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlStr, mimeType);

  // Is there any parsing error ?.
  /*
  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    const xmmStr = new XMLSerializer().serializeToString(xmlDoc);
    console.log(xmmStr);
    throw new Error(`Unexpected error parsing: ${xmlStr}. Error: ${xmmStr}`);
  }
  */

  return xmlDoc;
};

export const parseXMLFile = (filePath: fs.PathOrFileDescriptor, mimeType: DOMParserSupportedType) => {
  const stream = fs.readFileSync(filePath, { encoding: 'utf-8' });

  let content = stream.toString();
  // Hack for SVG exported from the browser ...
  if (mimeType === 'image/svg+xml') {
    content = content.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');
  }

  return parseXMLString(content, mimeType);
};

export const exporterAssert = async (testName: string, importer: Importer) => {
  const actualMindmap = await importer.import(testName, '');

  // Load mindmap file..
  const mindmapPath = path.resolve(__dirname, `./expected/${testName}.wxml`);
  if (saveOutputRecord) {
    fs.writeFileSync(mindmapPath, actualMindmap);
  }

  const mindmapExpect = fs.readFileSync(mindmapPath).toString();

  // Compare with expected...
  if (actualMindmap !== mindmapExpect) {
    const diffResult = diff(actualMindmap, mindmapExpect);
    console.log(diffResult);
    expect(actualMindmap).toEqual(mindmapExpect);
  }
};
