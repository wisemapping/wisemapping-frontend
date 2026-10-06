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

import { describe, expect, test } from '@jest/globals';
import { deflateSync, strFromU8, strToU8, zipSync } from 'fflate';
import readZipEntries from '../../../src/components/import/support/ZipEntries';
import type { ZipLimits } from '../../../src/components/import/support/ZipEntries';
import { BOMB_BYTES_PER_PAIR, deflateBomb, rawZip } from './ZipBomb';

const MB = 1024 * 1024;

class TooLarge extends Error {}

const limits = (accept: (name: string) => boolean, maxBytes = 50 * MB): ZipLimits => ({
  accept,
  maxBytes,
  tooLarge: () => new TooLarge('too large'),
});

const all = limits(() => true);

const texts = (files: Record<string, Uint8Array>): Record<string, string> =>
  Object.fromEntries(Object.entries(files).map(([name, data]) => [name, strFromU8(data)]));

describe('readZipEntries', () => {
  test('reads the deflated and stored entries of an archive made by fflate', () => {
    const zip = zipSync({
      'content.json': [strToU8('{"a":1}'), { level: 9 }],
      'stored.txt': [strToU8('plain'), { level: 0 }],
      'nested/dir/content.xml': strToU8('<x/>'.repeat(1000)),
    });

    expect(texts(readZipEntries(zip, all))).toEqual({
      'content.json': '{"a":1}',
      'stored.txt': 'plain',
      'nested/dir/content.xml': '<x/>'.repeat(1000),
    });
  });

  test('reads an archive given as a view into a larger buffer', () => {
    const zip = zipSync({ 'a.txt': strToU8('view') });
    const padded = new Uint8Array(zip.length + 10);
    padded.set(zip, 5);

    expect(texts(readZipEntries(padded.subarray(5, 5 + zip.length), all))).toEqual({
      'a.txt': 'view',
    });
  });

  test('reads an archive with a comment after its end record', () => {
    const zip = zipSync({ 'a.txt': strToU8('commented') });
    // Write a 3-byte comment length and append it.
    const withComment = new Uint8Array(zip.length + 3);
    withComment.set(zip);
    new DataView(withComment.buffer).setUint16(zip.length - 2, 3, true);
    withComment.set(strToU8('abc'), zip.length);

    expect(texts(readZipEntries(withComment, all))).toEqual({ 'a.txt': 'commented' });
  });

  test('inflates only the accepted entries', () => {
    const zip = rawZip([
      { name: 'keep.txt', data: deflateSync(strToU8('kept')), compression: 8, originalSize: 4 },
      // Inflating it would throw: an unknown method and a 4 GB size.
      { name: 'skip.bin', data: new Uint8Array(10), compression: 99, originalSize: 0xffffffff },
    ]);

    expect(
      texts(
        readZipEntries(
          zip,
          limits((name) => name === 'keep.txt'),
        ),
      ),
    ).toEqual({
      'keep.txt': 'kept',
    });
  });

  test('reads the sizes and offsets of zip64 entries and a utf-8 name', () => {
    const zip = rawZip(
      [
        { name: 'first.txt', data: strToU8('one'), compression: 0, originalSize: 3 },
        {
          name: 'conteúdo.json',
          data: deflateSync(strToU8('two')),
          compression: 8,
          originalSize: 3,
        },
      ],
      true,
    );

    expect(texts(readZipEntries(zip, all))).toEqual({ 'first.txt': 'one', 'conteúdo.json': 'two' });
  });

  test('reads from the zip64 extra field only the values whose 32-bit field is 0xffffffff', () => {
    const zip = rawZip(
      [{ name: 'a.txt', data: strToU8('abc'), compression: 0, originalSize: 3 }],
      true,
    );
    // The first entry is at offset 0: write it in the central header. The extra field still
    // starts with the two sizes, so its third value is not read.
    const central = new DataView(zip.buffer).getUint32(zip.length - 22 - 20 - 56 + 48, true);
    new DataView(zip.buffer).setUint32(central + 42, 0, true);

    expect(texts(readZipEntries(zip, all))).toEqual({ 'a.txt': 'abc' });
  });

  test('rejects, before inflating anything, accepted entries declaring more than the cap', () => {
    const entry = { data: deflateSync(strToU8('x')), compression: 8, originalSize: 30 * MB };
    const zip = rawZip([
      { name: 'a', ...entry },
      { name: 'b', ...entry },
    ]);

    expect(() => readZipEntries(zip, all)).toThrow(TooLarge);
    expect(
      texts(
        readZipEntries(
          zip,
          limits((name) => name === 'a'),
        ),
      ),
    ).toEqual({ a: 'x' });
  });

  test('stops inflating an entry once it passes its declared size, in bounded time', () => {
    // About 1 GB of zeros in 6.5 MB, declared as 20 bytes. Inflating the whole stream takes
    // seconds; the reader stops after the first step.
    const pairs = 4_000_000;
    const zip = rawZip([
      { name: 'content.json', data: deflateBomb(pairs), compression: 8, originalSize: 20 },
    ]);
    expect(pairs * BOMB_BYTES_PER_PAIR).toBeGreaterThan(980 * MB);

    const started = Date.now();
    expect(() => readZipEntries(zip, all)).toThrow(/content.json inflates past its declared size/);
    expect(Date.now() - started).toBeLessThan(500);
  });

  test('stops inflating at the declared size even when it is within the cap', () => {
    const zip = rawZip([
      { name: 'content.json', data: deflateBomb(1_000_000), compression: 8, originalSize: MB },
    ]);

    expect(() => readZipEntries(zip, all)).toThrow(/past its declared size/);
  });

  test('accepts an entry that inflates to less than it declares', () => {
    const zip = rawZip([
      { name: 'a.txt', data: deflateSync(strToU8('short')), compression: 8, originalSize: 100 },
    ]);

    expect(texts(readZipEntries(zip, all))).toEqual({ 'a.txt': 'short' });
  });

  test('rejects a stored entry larger than it declares', () => {
    const zip = rawZip([
      { name: 'a.txt', data: strToU8('too long'), compression: 0, originalSize: 3 },
    ]);

    expect(() => readZipEntries(zip, all)).toThrow(/larger than its declared size/);
  });

  test('rejects an accepted entry with an unknown compression method', () => {
    const zip = rawZip([{ name: 'a', data: new Uint8Array(4), compression: 12, originalSize: 4 }]);

    expect(() => readZipEntries(zip, all)).toThrow('unknown compression type 12');
  });

  test('rejects a truncated deflate stream', () => {
    const data = deflateSync(strToU8('a longer text that is cut short '.repeat(20)));
    const zip = rawZip([
      { name: 'a', data: data.subarray(0, data.length - 8), compression: 8, originalSize: 1000 },
    ]);

    expect(() => readZipEntries(zip, all)).toThrow();
  });

  describe('corrupt archives', () => {
    const valid = (): Uint8Array =>
      rawZip([{ name: 'a.txt', data: strToU8('abc'), compression: 0, originalSize: 3 }]);
    const centralOffset = (zip: Uint8Array): number =>
      new DataView(zip.buffer).getUint32(zip.length - 6, true);

    test('without an end of central directory record', () => {
      expect(() => readZipEntries(strToU8('PK this is not a zip archive at all'), all)).toThrow(
        'invalid zip data',
      );
      expect(() => readZipEntries(new Uint8Array(4), all)).toThrow('invalid zip data');
    });

    test('with a central directory that does not start with its signature', () => {
      const zip = valid();
      zip[centralOffset(zip)] = 0;

      expect(() => readZipEntries(zip, all)).toThrow('invalid zip data');
    });

    test('with an entry that points to no local header', () => {
      const zip = valid();
      zip[0] = 0;

      expect(() => readZipEntries(zip, all)).toThrow('invalid zip data');
    });

    test('with an entry whose data runs past the end of the archive', () => {
      const zip = valid();
      new DataView(zip.buffer).setUint32(centralOffset(zip) + 20, 1000, true);

      expect(() => readZipEntries(zip, all)).toThrow('invalid zip data');
    });

    test('with a central directory that points past the end of the archive', () => {
      const zip = valid();
      new DataView(zip.buffer).setUint32(zip.length - 6, 0xfffff, true);

      expect(() => readZipEntries(zip, all)).toThrow('invalid zip data');
    });

    test('with a zip64 locator pointing to no zip64 record', () => {
      const zip = rawZip(
        [{ name: 'a.txt', data: strToU8('abc'), compression: 0, originalSize: 3 }],
        true,
      );
      // Break the zip64 end record: the 32-bit end record is used, whose offset is 0xffffffff.
      zip[zip.length - 22 - 20 - 56] = 0;

      expect(() => readZipEntries(zip, all)).toThrow('invalid zip data');
    });
  });
});
