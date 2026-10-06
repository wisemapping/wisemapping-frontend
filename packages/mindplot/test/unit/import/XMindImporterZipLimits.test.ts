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

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { strFromU8, strToU8, zipSync } from 'fflate';
import XMindImporter from '../../../src/components/import/XMindImporter';
import ImportError from '../../../src/components/import/ImportError';
import { deflateBomb, rawZip } from './ZipBomb';

const sheet = JSON.stringify([
  { id: 'sheet1', class: 'sheet', rootTopic: { id: 'root', title: 'Zip Root' } },
]);

const MB = 1024 * 1024;

/**
 * Rewrites the compression method and/or the declared uncompressed size of one entry, in both
 * its local and its central directory header, of an archive made by zipSync.
 */
const patchEntry = (
  zip: Uint8Array,
  name: string,
  patch: { compression?: number; originalSize?: number },
): Uint8Array => {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  Array.from({ length: zip.length - 4 }, (_, i) => i).forEach((i) => {
    const signature = view.getUint32(i, true);
    // The central directory header has the same fields as the local one, 2 bytes later.
    const shift = { 0x04034b50: 0, 0x02014b50: 2 }[signature];
    if (shift === undefined) {
      return;
    }
    const nameStart = i + (shift ? 46 : 30);
    const nameLength = view.getUint16(i + 26 + shift, true);
    if (strFromU8(zip.subarray(nameStart, nameStart + nameLength)) !== name) {
      return;
    }
    if (patch.compression !== undefined) {
      view.setUint16(i + 8 + shift, patch.compression, true);
    }
    if (patch.originalSize !== undefined) {
      view.setUint32(i + 22 + shift, patch.originalSize, true);
    }
  });
  return zip;
};

const rootTitle = (xml: string): string | null => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return doc.querySelector('topic[central="true"]')?.getAttribute('text') ?? null;
};

describe('XMindImporter zip limits', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('test helper patches the declared size of the named entry only', () => {
    const zip = patchEntry(
      zipSync({ 'content.json': strToU8(sheet), 'metadata.json': strToU8('{}') }),
      'content.json',
      { originalSize: 7 },
    );
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);

    // The first local header is content.json's.
    expect(view.getUint32(22, true)).toBe(7);
  });

  test('rejects, before inflating it, a content entry declaring a huge uncompressed size', async () => {
    const zip = patchEntry(zipSync({ 'content.json': strToU8(sheet) }), 'content.json', {
      originalSize: 0xfffffff0,
    });

    const started = Date.now();
    const result = new XMindImporter(zip).import('bomb');

    await expect(result).rejects.toThrow(ImportError);
    await expect(result).rejects.toThrow(/too large.*50 MB/);
    expect(Date.now() - started).toBeLessThan(1000);
  });

  test('rejects a real zip bomb: a content.json over 50 MB that compresses to a few KB', async () => {
    const padding = ' '.repeat(50 * MB);
    const zip = zipSync({ 'content.json': strToU8(`${sheet}${padding}`) }, { level: 1 });
    expect(zip.length).toBeLessThan(MB);

    await expect(new XMindImporter(zip).import('bomb')).rejects.toThrow(/too large/);
  });

  test('counts every inflated content entry against the cap', async () => {
    const zip = patchEntry(
      patchEntry(
        zipSync({ 'content.json': strToU8(sheet), 'content.xml': strToU8('<xmap-content/>') }),
        'content.json',
        { originalSize: 30 * MB },
      ),
      'content.xml',
      { originalSize: 30 * MB },
    );

    await expect(new XMindImporter(zip).import('bomb')).rejects.toThrow(/too large/);
  });

  test('does not inflate the entries it does not read, however big they claim to be', async () => {
    // An unknown compression method and a 4 GB size: inflating this entry would throw or
    // allocate 4 GB, so the import only succeeds if the entry is skipped.
    const zip = patchEntry(
      zipSync({
        'content.json': strToU8(sheet),
        'Thumbnails/thumbnail.png': new Uint8Array(1024).fill(7),
        'resources/huge.bin': new Uint8Array(1024).fill(9),
      }),
      'resources/huge.bin',
      { compression: 99, originalSize: 0xffffffff },
    );

    expect(rootTitle(await new XMindImporter(zip).import('ok'))).toBe('Zip Root');
  });

  test('still imports content.json nested in a folder', async () => {
    const zip = zipSync({ 'nested/content.json': strToU8(sheet) });

    expect(rootTitle(await new XMindImporter(zip).import('ok'))).toBe('Zip Root');
  });

  test('a content entry that lies about its size can not inflate past the declared size', async () => {
    // Declared 100 bytes, really about 1 MB: the output buffer is the declared size, so the
    // JSON is cut short and rejected instead of filling memory.
    const zip = patchEntry(
      zipSync({ 'content.json': strToU8(`${sheet}${' '.repeat(MB)}`) }),
      'content.json',
      { originalSize: 20 },
    );

    await expect(new XMindImporter(zip).import('liar')).rejects.toThrow(ImportError);
  });

  test('stops inflating a content entry that lies about its size, in bounded time', async () => {
    // A content.json declared as 20 bytes whose stream inflates to about 1 GB: fflate's unzipSync
    // decoded the whole stream (seconds of CPU) even though it kept only 20 bytes.
    const zip = rawZip([
      { name: 'content.json', data: deflateBomb(4_000_000), compression: 8, originalSize: 20 },
    ]);

    const started = Date.now();
    await expect(new XMindImporter(zip).import('liar')).rejects.toThrow(/past its declared size/);
    expect(Date.now() - started).toBeLessThan(500);
  });
});
