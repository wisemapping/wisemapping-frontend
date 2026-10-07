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

import { Inflate, strFromU8 } from 'fflate';

export type ZipLimits = {
  /** The entries to inflate, by name. The others are never inflated. */
  accept: (name: string) => boolean;
  /** Cap on the sum of the uncompressed sizes of the accepted entries. */
  maxBytes: number;
  /** The error thrown when the accepted entries exceed maxBytes. */
  tooLarge: () => Error;
};

type ZipEntry = {
  name: string;
  compression: number;
  compressedSize: number;
  originalSize: number;
  localOffset: number;
};

const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const ZIP64_END_LOCATOR = 0x07064b50;
const ZIP64_END_OF_CENTRAL_DIRECTORY = 0x06064b50;
const CENTRAL_DIRECTORY_HEADER = 0x02014b50;
const LOCAL_FILE_HEADER = 0x04034b50;
const ZIP64_EXTRA_FIELD = 0x0001;
const UTF8_NAME_FLAG = 0x0800;

// Compressed bytes inflated per step. DEFLATE expands a byte at most about 1032 times, so a step
// inflates at most about 4 MB before the size is checked again.
const INFLATE_STEP = 4 * 1024;

const corrupt = (): Error => new Error('invalid zip data');

const readUint64 = (view: DataView, offset: number): number =>
  view.getUint32(offset, true) + view.getUint32(offset + 4, true) * 2 ** 32;

const findEndOfCentralDirectory = (view: DataView): number => {
  // The record is 22 bytes, followed by a comment of up to 65535 bytes.
  const last = view.byteLength - 22;
  const first = Math.max(0, last - 0xffff);
  for (let offset = last; offset >= first; offset -= 1) {
    if (view.getUint32(offset, true) === END_OF_CENTRAL_DIRECTORY) {
      return offset;
    }
  }
  throw corrupt();
};

/** Where the central directory starts and how many entries it has, from the zip64 record if any. */
const centralDirectory = (view: DataView): { offset: number; count: number } => {
  const end = findEndOfCentralDirectory(view);
  const locator = end - 20;
  if (locator >= 0 && view.getUint32(locator, true) === ZIP64_END_LOCATOR) {
    const zip64End = readUint64(view, locator + 8);
    if (view.getUint32(zip64End, true) === ZIP64_END_OF_CENTRAL_DIRECTORY) {
      return { count: readUint64(view, zip64End + 32), offset: readUint64(view, zip64End + 48) };
    }
  }
  return { count: view.getUint16(end + 10, true), offset: view.getUint32(end + 16, true) };
};

/** The sizes and offset of an entry, replaced by the ones of its zip64 extra field if set. */
const zip64Values = (
  view: DataView,
  extraStart: number,
  extraEnd: number,
  values: [number, number, number],
): [number, number, number] => {
  for (let at = extraStart; at + 4 <= extraEnd; at += 4 + view.getUint16(at + 2, true)) {
    if (view.getUint16(at, true) === ZIP64_EXTRA_FIELD) {
      // The field holds, in this order, only the values whose 32-bit field is 0xffffffff.
      let field = at + 4;
      return values.map((value) => {
        if (value !== 0xffffffff) {
          return value;
        }
        const wide = readUint64(view, field);
        field += 8;
        return wide;
      }) as [number, number, number];
    }
  }
  return values;
};

const readCentralDirectory = (data: Uint8Array, view: DataView): ZipEntry[] => {
  const { offset, count } = centralDirectory(view);
  const entries: ZipEntry[] = [];
  let at = offset;
  for (let i = 0; i < count; i += 1) {
    if (view.getUint32(at, true) !== CENTRAL_DIRECTORY_HEADER) {
      throw corrupt();
    }
    const flags = view.getUint16(at + 8, true);
    const nameLength = view.getUint16(at + 28, true);
    const extraLength = view.getUint16(at + 30, true);
    const commentLength = view.getUint16(at + 32, true);
    const nameStart = at + 46;
    const extraStart = nameStart + nameLength;
    const [originalSize, compressedSize, localOffset] = zip64Values(
      view,
      extraStart,
      extraStart + extraLength,
      [view.getUint32(at + 24, true), view.getUint32(at + 20, true), view.getUint32(at + 42, true)],
    );
    // eslint-disable-next-line no-bitwise -- a flag of the general purpose bit field
    const utf8Name = (flags & UTF8_NAME_FLAG) !== 0;
    entries.push({
      name: strFromU8(data.subarray(nameStart, extraStart), !utf8Name),
      compression: view.getUint16(at + 10, true),
      compressedSize,
      originalSize,
      localOffset,
    });
    at = extraStart + extraLength + commentLength;
  }
  return entries;
};

const compressedData = (data: Uint8Array, view: DataView, entry: ZipEntry): Uint8Array => {
  const at = entry.localOffset;
  if (view.getUint32(at, true) !== LOCAL_FILE_HEADER) {
    throw corrupt();
  }
  const start = at + 30 + view.getUint16(at + 26, true) + view.getUint16(at + 28, true);
  if (start + entry.compressedSize > data.length) {
    throw corrupt();
  }
  return data.subarray(start, start + entry.compressedSize);
};

/**
 * Inflates a DEFLATE stream a few KB at a time, and stops as soon as the output passes the size
 * the entry declares: an entry can not make the importer inflate more than it declares.
 */
const inflateEntry = (compressed: Uint8Array, entry: ZipEntry): Uint8Array => {
  const output = new Uint8Array(entry.originalSize);
  let length = 0;
  const inflater = new Inflate((chunk) => {
    if (length + chunk.length > output.length) {
      throw new Error(`the entry ${entry.name} inflates past its declared size`);
    }
    output.set(chunk, length);
    length += chunk.length;
  });
  for (let at = 0; at < compressed.length; at += INFLATE_STEP) {
    const end = Math.min(at + INFLATE_STEP, compressed.length);
    inflater.push(compressed.subarray(at, end), end === compressed.length);
  }
  return output.subarray(0, length);
};

/**
 * Reads the accepted entries of a zip archive. The sizes they declare are checked against the cap
 * before anything is inflated, and each one is inflated in small steps that stop once it passes
 * its declared size, so neither the memory nor the time spent depends on what the compressed
 * streams really hold.
 */
const readZipEntries = (data: Uint8Array, limits: ZipLimits): Record<string, Uint8Array> => {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  try {
    const entries = readCentralDirectory(data, view).filter((entry) => limits.accept(entry.name));
    const declared = entries.reduce((sum, entry) => sum + entry.originalSize, 0);
    if (declared > limits.maxBytes) {
      throw limits.tooLarge();
    }

    const files: Record<string, Uint8Array> = {};
    entries.forEach((entry) => {
      const compressed = compressedData(data, view, entry);
      if (entry.compression === 0) {
        if (compressed.length > entry.originalSize) {
          throw new Error(`the entry ${entry.name} is larger than its declared size`);
        }
        files[entry.name] = compressed.slice();
      } else if (entry.compression === 8) {
        files[entry.name] = inflateEntry(compressed, entry);
      } else {
        throw new Error(`unknown compression type ${entry.compression}`);
      }
    });
    return files;
  } catch (error) {
    // A header that points past the end of the data.
    throw error instanceof RangeError ? corrupt() : error;
  }
};

export default readZipEntries;
