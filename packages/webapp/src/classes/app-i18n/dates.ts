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

import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import dayjs, { type ConfigType, type Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(LocalizedFormat);

/**
 * Dates in the language the page is shown in, the one react-intl renders. Its dayjs locale is
 * loaded with its messages (see ./messages), so it is there by the time the page shows it. Per
 * date, not dayjs' global locale: a global changed in an effect missed the first paint and did
 * not re-render what it changed.
 */
export const useDate = (): ((value: ConfigType) => Dayjs) => {
  const { locale } = useIntl();
  return useCallback((value: ConfigType) => dayjs(value).locale(locale), [locale]);
};
