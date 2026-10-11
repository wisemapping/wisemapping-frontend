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

// Its own file: a module registry where no locale but English has been loaded yet.
import { renderHook, waitFor } from '@testing-library/react';
import { useLocaleData } from '../../../src/classes/i18n-msg';
import en from '../../../src/compiled-lang/en.json';
import ja from '../../../src/compiled-lang/ja.json';

describe('useLocaleData before its locale is loaded', () => {
  it('serves English, as English, then the locale once loaded', async () => {
    const { result } = renderHook(() => useLocaleData('ja'));
    expect(result.current).toEqual({ locale: 'en', messages: en });
    await waitFor(() => expect(result.current).toEqual({ locale: 'ja', messages: ja }));
  });
});
