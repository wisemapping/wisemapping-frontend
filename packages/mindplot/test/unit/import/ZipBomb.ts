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

import { strToU8 } from 'fflate';

/** The bytes one back-reference of the bomb inflates to. */
export const BOMB_BYTES_PER_PAIR = 258;

/**
 * A raw DEFLATE stream that inflates to `1 + pairs * 258` zero bytes: one fixed-Huffman block
 * with a literal 0 followed by `pairs` back-references of 258 bytes at distance 1. Each one takes
 * 13 bits, so the stream inflates about 160 times its size, and building it costs no compression.
 */
/* eslint-disable no-bitwise -- a DEFLATE stream is written bit by bit */
export const deflateBomb = (pairs: number): Uint8Array => {
  const out = new Uint8Array(Math.ceil((3 + 8 + pairs * 13 + 7) / 8));
  let bit = 0;
  const setBit = (value: number): void => {
    if (value) {
      const index = bit >> 3;
      out[index] = (out[index] ?? 0) | (1 << (bit & 7));
    }
    bit += 1;
  };
  // Header fields are written least significant bit first, Huffman codes most significant first.
  const writeValue = (value: number, length: number): void => {
    for (let i = 0; i < length; i += 1) {
      setBit((value >> i) & 1);
    }
  };
  const writeCode = (code: number, length: number): void => {
    for (let i = length - 1; i >= 0; i -= 1) {
      setBit((code >> i) & 1);
    }
  };

  writeValue(1, 1); // BFINAL
  writeValue(1, 2); // BTYPE: fixed Huffman codes
  writeCode(0b00110000, 8); // literal 0
  for (let i = 0; i < pairs; i += 1) {
    writeCode(0b11000101, 8); // length symbol 285: 258 bytes
    writeCode(0b00000, 5); // distance symbol 0: 1 byte back
  }
  writeCode(0b0000000, 7); // end of block
  return out;
};
/* eslint-enable no-bitwise */

export type RawZipEntry = {
  name: string;
  data: Uint8Array;
  /** 0 stored, 8 deflate. */
  compression: number;
  /** The uncompressed size written in the headers, true or not. */
  originalSize: number;
};

/**
 * A zip archive of the given entries, with their headers written as given (no CRC). With zip64,
 * the sizes and offsets are written in zip64 extra fields and a zip64 end of central directory.
 */
export const rawZip = (entries: RawZipEntry[], zip64 = false): Uint8Array => {
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  entries.forEach(({ name, data, compression, originalSize }) => {
    const fileName = strToU8(name);
    const local = new Uint8Array(30 + fileName.length + data.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(8, compression, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, originalSize, true);
    lv.setUint16(26, fileName.length, true);
    local.set(fileName, 30);
    local.set(data, 30 + fileName.length);

    // An unrelated extra field first, then the zip64 one.
    const extraLength = zip64 ? 8 + 4 + 24 : 0;
    const central = new Uint8Array(46 + fileName.length + extraLength);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 45, true);
    cv.setUint16(6, 45, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, compression, true);
    cv.setUint32(20, zip64 ? 0xffffffff : data.length, true);
    cv.setUint32(24, zip64 ? 0xffffffff : originalSize, true);
    cv.setUint16(28, fileName.length, true);
    cv.setUint16(30, extraLength, true);
    cv.setUint32(42, zip64 ? 0xffffffff : offset, true);
    central.set(fileName, 46);
    if (zip64) {
      const extra = 46 + fileName.length;
      cv.setUint16(extra, 0x5455, true);
      cv.setUint16(extra + 2, 4, true);
      cv.setUint16(extra + 8, 0x0001, true);
      cv.setUint16(extra + 10, 24, true);
      cv.setBigUint64(extra + 12, BigInt(originalSize), true);
      cv.setBigUint64(extra + 20, BigInt(data.length), true);
      cv.setBigUint64(extra + 28, BigInt(offset), true);
    }

    locals.push(local);
    centrals.push(central);
    offset += local.length;
  });

  const centralSize = centrals.reduce((sum, c) => sum + c.length, 0);
  const trailer: Uint8Array[] = [];
  if (zip64) {
    const record = new Uint8Array(56);
    const rv = new DataView(record.buffer);
    rv.setUint32(0, 0x06064b50, true);
    rv.setBigUint64(4, 44n, true);
    rv.setBigUint64(24, BigInt(entries.length), true);
    rv.setBigUint64(32, BigInt(entries.length), true);
    rv.setBigUint64(40, BigInt(centralSize), true);
    rv.setBigUint64(48, BigInt(offset), true);
    const locator = new Uint8Array(20);
    const xv = new DataView(locator.buffer);
    xv.setUint32(0, 0x07064b50, true);
    xv.setBigUint64(8, BigInt(offset + centralSize), true);
    xv.setUint32(16, 1, true);
    trailer.push(record, locator);
  }
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, zip64 ? 0xffff : entries.length, true);
  ev.setUint16(10, zip64 ? 0xffff : entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, zip64 ? 0xffffffff : offset, true);
  trailer.push(end);

  const parts = [...locals, ...centrals, ...trailer];
  const zip = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  parts.reduce((at, part) => {
    zip.set(part, at);
    return at + part.length;
  }, 0);
  return zip;
};
