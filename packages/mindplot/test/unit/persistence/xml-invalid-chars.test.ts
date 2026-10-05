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
import XMLSerializerTango from '../../../src/components/persistence/XMLSerializerTango';

class Probe extends XMLSerializerTango {
  strip(str: string): string {
    return this._rmXmlInv(str);
  }
}

// Reference: a code point loop over the XML 1.0 Char production
// (#x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]).
const isXmlChar = (c: number): boolean =>
  c === 0x9 ||
  c === 0xa ||
  c === 0xd ||
  (c >= 0x20 && c <= 0xd7ff) ||
  (c >= 0xe000 && c <= 0xfffd) ||
  (c >= 0x10000 && c <= 0x10ffff);

// Array.from walks code points, so a lone surrogate is visited on its own and removed.
const reference = (str: string): string =>
  Array.from(str)
    .filter((ch) => isXmlChar(ch.codePointAt(0)!))
    .join('');

// Deterministic PRNG (Park-Miller), so a failure can be reproduced.
const prng = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
};

// UTF-16 code units at and around every boundary of the Char production.
const EDGE_UNITS = [
  0x0, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0x1f, 0x20, 0x7f, 0xd7ff, 0xd800, 0xdbff, 0xdc00, 0xdfff,
  0xe000, 0xfffd, 0xfffe, 0xffff,
];

const randomUnits = (next: () => number): number[] => {
  const pick = (max: number): number => Math.floor(next() * max);
  const kind = pick(6);
  switch (kind) {
    case 0:
      return [pick(0x20)]; // control character
    case 1:
      return [EDGE_UNITS[pick(EDGE_UNITS.length)]];
    case 2: {
      // Valid surrogate pair, including U+10000 and U+10FFFF.
      const cp = pick(2) === 0 ? [0x10000, 0x10ffff, 0x1f600][pick(3)] : 0x10000 + pick(0x100000);
      const offset = cp - 0x10000;
      return [0xd800 + Math.floor(offset / 0x400), 0xdc00 + (offset % 0x400)];
    }
    case 3:
      return [0xd800 + pick(0x800)]; // lone (or accidentally paired) surrogate
    case 4:
      return [0x20 + pick(0x60)]; // printable ASCII
    default:
      return [pick(0x10000)]; // any BMP code unit
  }
};

describe('XMLSerializerTango._rmXmlInv', () => {
  const probe = new Probe();

  test('matches a code point reference loop on random strings', () => {
    const next = prng(20261005);
    for (let run = 0; run < 2000; run++) {
      const units: number[] = [];
      const length = Math.floor(next() * 40);
      for (let i = 0; i < length; i++) {
        units.push(...randomUnits(next));
      }
      const input = String.fromCharCode(...units);

      expect(probe.strip(input)).toBe(reference(input));
    }
  });

  test('matches the reference on every BMP code unit and the astral edges', () => {
    Array.from({ length: 0x10000 }, (_, unit) => `a${String.fromCharCode(unit)}b`).forEach(
      (input) => expect(probe.strip(input)).toBe(reference(input)),
    );
    [0x10000, 0x1f600, 0xeffff, 0x10ffff].forEach((cp) => {
      const input = String.fromCodePoint(cp);
      expect(probe.strip(input)).toBe(input);
    });
  });
});
