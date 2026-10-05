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
import { toTextWeight } from '../../src/components/FontWeightType';

describe('toTextWeight (W4)', () => {
  it('draws the theme weight 600 bold and keeps normal and bold', () => {
    expect(toTextWeight('600')).toBe('bold');
    expect(toTextWeight('bold')).toBe('bold');
    expect(toTextWeight('normal')).toBe('normal');
  });
});
