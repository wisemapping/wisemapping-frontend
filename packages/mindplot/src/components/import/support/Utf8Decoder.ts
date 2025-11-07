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

type BufferCtor = {
  from(array: Uint8Array): { toString(encoding: 'utf-8'): string };
};

const toUint8Array = (input: ArrayBuffer | Uint8Array): Uint8Array => {
  if (input instanceof Uint8Array) {
    return input;
  }
  return new Uint8Array(input);
};

const decodeWithNodeBuffer = (input: ArrayBuffer | Uint8Array): string | null => {
  const globalWithBuffer = globalThis as unknown as { Buffer?: BufferCtor };
  if (globalWithBuffer.Buffer) {
    return globalWithBuffer.Buffer.from(toUint8Array(input)).toString('utf-8');
  }
  return null;
};

const getTextDecoder = (): TextDecoder | null => {
  if (typeof globalThis.TextDecoder !== 'undefined') {
    return new globalThis.TextDecoder('utf-8');
  }
  return null;
};

export const decodeUtf8 = (input: ArrayBuffer | Uint8Array): string => {
  const decoder = getTextDecoder();
  if (decoder) {
    return decoder.decode(toUint8Array(input));
  }

  const bufferDecoded = decodeWithNodeBuffer(input);
  if (bufferDecoded !== null) {
    return bufferDecoded;
  }

  throw new Error('UTF-8 decoding is not supported in this environment.');
};

export const tryDecodeUtf8 = (input: ArrayBuffer | Uint8Array): string | null => {
  try {
    return decodeUtf8(input);
  } catch (error) {
    console.warn('Failed to decode UTF-8 content:', error);
    return null;
  }
};
