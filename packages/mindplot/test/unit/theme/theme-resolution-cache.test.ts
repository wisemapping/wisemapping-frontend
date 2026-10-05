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
import ThemeResolutionCache from '../../../src/components/theme/ThemeResolutionCache';

describe('ThemeResolutionCache', () => {
  it('computes every time outside a pass', () => {
    const owner = {};
    const compute = jest.fn(() => 1);
    ThemeResolutionCache.memo(owner, 'k', compute);
    ThemeResolutionCache.memo(owner, 'k', compute);
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('computes once per owner and key during a pass, nested passes included', () => {
    const a = {};
    const b = {};
    const compute = jest.fn(() => undefined);
    ThemeResolutionCache.run(() => {
      ThemeResolutionCache.memo(a, 'k', compute);
      ThemeResolutionCache.run(() => {
        // undefined is a value too ...
        ThemeResolutionCache.memo(a, 'k', compute);
        ThemeResolutionCache.memo(b, 'k', compute);
        ThemeResolutionCache.memo(a, 'other', compute);
      });
      ThemeResolutionCache.memo(b, 'k', compute);
    });
    expect(compute).toHaveBeenCalledTimes(3);
  });

  it('forgets the values when the pass ends, even if it throws', () => {
    const owner = {};
    const compute = jest.fn(() => 1);
    expect(() =>
      ThemeResolutionCache.run(() => {
        ThemeResolutionCache.memo(owner, 'k', compute);
        throw new Error('redraw failed');
      }),
    ).toThrow('redraw failed');
    ThemeResolutionCache.run(() => ThemeResolutionCache.memo(owner, 'k', compute));
    ThemeResolutionCache.memo(owner, 'k', compute);
    expect(compute).toHaveBeenCalledTimes(3);
  });

  it('returns what run returns', () => {
    expect(ThemeResolutionCache.run(() => 42)).toBe(42);
  });
});
