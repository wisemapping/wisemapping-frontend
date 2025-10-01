/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@jest/globals';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';
import WisemappingImporter from '../../../src/components/import/WisemappingImporter';
import FreemindImporter from '../../../src/components/import/FreemindImporter';
import FreeplaneImporter from '../../../src/components/import/FreeplaneImporter';
import XMindImporter from '../../../src/components/import/XMindImporter';
import MindManagerImporter from '../../../src/components/import/MindManagerImporter';
import OPMLImporter from '../../../src/components/import/OPMLImporter';

describe('TextImporterFactory', () => {
  const sampleContent = '<test>content</test>';

  test('should create WisemappingImporter for wxml type', () => {
    const importer = TextImporterFactory.create('wxml', sampleContent);
    expect(importer).toBeInstanceOf(WisemappingImporter);
  });

  test('should create FreemindImporter for mm type (FreeMind)', () => {
    const freemindContent = '<map version="1.0.1"><node TEXT="test"/></map>';
    const importer = TextImporterFactory.create('mm', freemindContent);
    expect(importer).toBeInstanceOf(FreemindImporter);
  });

  test('should create FreeplaneImporter for mm type (Freeplane)', () => {
    const freeplaneContent = '<map version="freeplane 1.9.13"><node TEXT="test"/></map>';
    const importer = TextImporterFactory.create('mm', freeplaneContent);
    expect(importer).toBeInstanceOf(FreeplaneImporter);
  });

  test('should create FreeplaneImporter for mmx type', () => {
    const importer = TextImporterFactory.create('mmx', sampleContent);
    expect(importer).toBeInstanceOf(FreeplaneImporter);
  });

  test('should create XMindImporter for xmind type', () => {
    const importer = TextImporterFactory.create('xmind', sampleContent);
    expect(importer).toBeInstanceOf(XMindImporter);
  });

  test('should create MindManagerImporter for mmap type', () => {
    const importer = TextImporterFactory.create('mmap', sampleContent);
    expect(importer).toBeInstanceOf(MindManagerImporter);
  });

  test('should create OPMLImporter for opml type', () => {
    const importer = TextImporterFactory.create('opml', sampleContent);
    expect(importer).toBeInstanceOf(OPMLImporter);
  });

  test('should throw error for unsupported type', () => {
    expect(() => {
      TextImporterFactory.create('unsupported', sampleContent);
    }).toThrow('Unsupported type unsupported');
  });

  test('should throw error for undefined type', () => {
    expect(() => {
      TextImporterFactory.create(undefined, sampleContent);
    }).toThrow('Unsupported type undefined');
  });
});
