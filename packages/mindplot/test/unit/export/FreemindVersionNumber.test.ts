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
import { describe, expect, test } from '@jest/globals';
import VersionNumber from '../../../src/components/export/freemind/importer/VersionNumber';

const v = (version: string) => new VersionNumber(version);

describe('Freemind VersionNumber', () => {
  test('isGreaterThan is true only for newer versions', () => {
    expect(v('1.1.0').isGreaterThan(v('1.0.1'))).toBe(true);
    expect(v('1.0.2').isGreaterThan(v('1.0.1'))).toBe(true);
    expect(v('0.9.0').isGreaterThan(v('1.0.1'))).toBe(false);
    expect(v('1.0.1').isGreaterThan(v('1.0.1'))).toBe(false);
  });

  test('compareTo handles versions with a different number of tokens', () => {
    expect(v('1.0').compareTo(v('1.0.0'))).toBe(0);
    expect(v('1.0.0').compareTo(v('1.0'))).toBe(0);
    expect(v('1.0').compareTo(v('1.0.1'))).toBe(-1);
    expect(v('1.0.1').compareTo(v('1.0'))).toBe(1);
    expect(v('1.1').compareTo(v('1.0.1'))).toBe(1);
  });
});
