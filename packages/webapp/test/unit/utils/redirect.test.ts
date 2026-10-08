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

import { DEFAULT_REDIRECT, safeRedirectPath } from '../../../src/utils/redirect';

describe('safeRedirectPath', () => {
  test.each([
    ['/c/maps/3/edit', '/c/maps/3/edit'],
    ['/c/maps/3/edit?shared=true#top', '/c/maps/3/edit?shared=true#top'],
    ['/c/maps/', '/c/maps/'],
  ])('keeps the path %s on this site', (value, expected) => {
    expect(safeRedirectPath(value)).toBe(expected);
  });

  test.each([
    ['javascript:alert(document.cookie)'],
    ['JavaScript:alert(1)'],
    ['data:text/html,<script>alert(1)</script>'],
    ['https://evil.example/c/maps/'],
    ['//evil.example/c/maps/'],
    ['/\\evil.example'],
    ['\\\\evil.example'],
    ['c/maps/3'],
    ['wisemapping'],
    [''],
    [null],
    [undefined],
  ])('falls back for %p', (value) => {
    expect(safeRedirectPath(value)).toBe(DEFAULT_REDIRECT);
  });

  test('uses the fallback it is given', () => {
    expect(safeRedirectPath('https://evil.example', '/c/login')).toBe('/c/login');
  });
});
