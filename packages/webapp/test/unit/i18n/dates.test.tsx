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

import { renderHook } from '@testing-library/react';
import dayjs from 'dayjs';
import { useDate } from '../../../src/classes/app-i18n/dates';
import { loadMessages } from '../../../src/classes/app-i18n/messages';
import type { LocaleCode } from '../../../src/classes/app-i18n';
// Jest maps react-intl to this mock (see jest.config.js): its locale is the one useIntl returns.
import { intl } from '../mocks/react-intl';

const dateIn = (locale: LocaleCode) => {
  intl.locale = locale;
  return renderHook(() => useDate()).result.current;
};

afterEach(() => {
  intl.locale = 'en';
});

describe('useDate', () => {
  test('formats in the locale the page is shown in, once its messages are loaded', async () => {
    await loadMessages('es');
    expect(dateIn('es')('2020-01-15T10:00:00').format('LLL')).toMatch(/enero/);
    expect(dateIn('es')(dayjs().subtract(2, 'day')).fromNow()).toBe('hace 2 días');
  });

  test('formats zh-CN in Mandarin', async () => {
    await loadMessages('zh-CN');
    expect(dateIn('zh-CN')('2020-01-15T10:00:00').format('LL')).toBe('2020年1月15日');
  });

  test('formats in English, and leaves the global dayjs locale alone', async () => {
    await loadMessages('fr');
    expect(dateIn('en')('2020-01-15T10:00:00').format('LL')).toBe('January 15, 2020');
    dateIn('fr')('2020-01-15T10:00:00');
    expect(dayjs.locale()).toBe('en');
  });

  test('loading a locale registers its dayjs locale', async () => {
    expect(dayjs.Ls.ja).toBeUndefined();
    await loadMessages('ja');
    expect(dayjs.Ls.ja).toBeDefined();
  });
});
