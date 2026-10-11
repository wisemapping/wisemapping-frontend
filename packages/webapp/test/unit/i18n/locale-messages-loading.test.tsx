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

import { renderHook, waitFor } from '@testing-library/react';
import {
  getLoadedMessages,
  loadMessages,
  preloadMessages,
  useLocaleMessages,
} from '../../../src/classes/app-i18n/messages';
import { Locales, type LocaleCode } from '../../../src/classes/app-i18n';
import en from '../../../src/compiled-lang/en.json';
import ja from '../../../src/compiled-lang/ja.json';
import es from '../../../src/compiled-lang/es.json';
import fr from '../../../src/compiled-lang/fr.json';

// The first test runs before any other locale is loaded: the order of the tests matters here.
describe('locale messages', () => {
  test('serve English, as English, until the locale is loaded, then the locale', async () => {
    expect(getLoadedMessages('ja')).toBeUndefined();
    const { result } = renderHook(() => useLocaleMessages('ja'));
    expect(result.current).toEqual({ locale: 'en', messages: en });
    await waitFor(() => expect(result.current).toEqual({ locale: 'ja', messages: ja }));
  });

  test('English is there without loading', () => {
    expect(getLoadedMessages('en')).toEqual(en);
  });

  test.each(Object.values(Locales).map((locale) => locale.code))(
    'every supported locale loads (%s)',
    async (code) => {
      const messages = await loadMessages(code);
      expect(Object.keys(messages)).toEqual(expect.arrayContaining(Object.keys(en).slice(0, 5)));
      expect(getLoadedMessages(code)).toBe(messages);
    },
  );

  test('a loaded locale is served from the first render', async () => {
    await loadMessages('es');
    const { result } = renderHook(() => useLocaleMessages('es'));
    expect(result.current).toEqual({ locale: 'es', messages: es });
  });

  test('switching to a loaded locale takes effect in the same render', async () => {
    await loadMessages('fr');
    const { result, rerender } = renderHook(({ code }) => useLocaleMessages(code), {
      initialProps: { code: 'es' as LocaleCode },
    });
    rerender({ code: 'fr' });
    expect(result.current).toEqual({ locale: 'fr', messages: fr });
  });

  test('preloading falls back to English when the chunk can not be fetched', async () => {
    jest.resetModules();
    jest.doMock('../../../src/compiled-lang/de.json', () => {
      throw new Error('chunk gone');
    });
    const fresh = await import('../../../src/classes/app-i18n/messages');
    await expect(fresh.preloadMessages('de')).resolves.toEqual(en);
    expect(fresh.getLoadedMessages('de')).toBeUndefined();
    jest.dontMock('../../../src/compiled-lang/de.json');
  });

  test('preloading a loaded locale resolves to its messages', async () => {
    await expect(preloadMessages('es')).resolves.toEqual(es);
  });
});
